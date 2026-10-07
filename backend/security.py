"""
O'zMU JBNUU KPI Axborot Tizimi - Xavfsizlik va Kriptografiya Moduli.
- Parollarni tuzlangan PBKDF2-SHA256 orqali xeshlash va tekshirish (Zero-plaintext storage)
- Standart HMAC-SHA256 asosidagi raqamli imzolangan JWT tokenlar (RFC 7519)
- Rolga asoslangan avtorizatsiya va ruxsatlarni qat'iy tekshirish (Server-side RBAC)
"""

import os
import json
import base64
import hmac
import hashlib
import secrets
import time
from typing import Optional, Dict, Any, List
from fastapi import Request, HTTPException, status, Header

# JWT maxfiy kaliti (Environment yoki doimiy fayldan)
JWT_SECRET_FILE = os.path.join(os.path.dirname(__file__), ".jwt_secret")
def _load_or_generate_jwt_secret() -> str:
    env_secret = os.getenv("JWT_SECRET_KEY")
    if env_secret and len(env_secret) >= 16:
        return env_secret
    if os.path.exists(JWT_SECRET_FILE):
        try:
            with open(JWT_SECRET_FILE, "r") as f:
                s = f.read().strip()
                if len(s) >= 16:
                    return s
        except Exception:
            pass
    new_secret = secrets.token_urlsafe(48)
    try:
        with open(JWT_SECRET_FILE, "w") as f:
            f.write(new_secret)
    except Exception:
        pass
    return new_secret

JWT_SECRET_KEY = _load_or_generate_jwt_secret()
JWT_ALGORITHM = "HS256"
JWT_DEFAULT_EXPIRY_SECONDS = 7 * 24 * 3600  # 7 kunlik seans

PBKDF2_ITERATIONS = 100_000

# ==========================================
# 1. PAROLLARNI XESHLASH VA TEKSHIRISH
# ==========================================

def hash_password(plain_password: str) -> str:
    """Parolni 16 baytli tuz bilan PBKDF2-SHA256 orqali xeshlaydi"""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        plain_password.encode('utf-8'),
        salt.encode('utf-8'),
        PBKDF2_ITERATIONS
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${key.hex()}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Xesh yoki eski ochiq matnli parolni xavfsiz taqqoslaydi (Timing attack resistant)"""
    if not stored_hash or not plain_password:
        return False

    if stored_hash.startswith("pbkdf2_sha256$"):
        try:
            parts = stored_hash.split("$")
            if len(parts) != 4:
                return False
            iterations = int(parts[1])
            salt = parts[2]
            expected_key = parts[3]
            calculated_key = hashlib.pbkdf2_hmac(
                'sha256',
                plain_password.encode('utf-8'),
                salt.encode('utf-8'),
                iterations
            ).hex()
            return hmac.compare_digest(calculated_key, expected_key)
        except Exception:
            return False

    # Eski tizimdan qolgan ochiq matn (legacy plaintext migration)
    return hmac.compare_digest(plain_password.strip(), stored_hash.strip())

def is_password_plain(stored_hash: str) -> bool:
    """Parol hali xeshlanmaganligini tekshiradi"""
    return not stored_hash.startswith("pbkdf2_sha256$")

# ==========================================
# 2. STANDART RAQAMLI IMZOLANGAN JWT (RFC 7519)
# ==========================================

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64_decode(data_str: str) -> bytes:
    rem = len(data_str) % 4
    if rem > 0:
        data_str += '=' * (4 - rem)
    return base64.urlsafe_b64decode(data_str.encode('utf-8'))

def create_jwt_token(payload: Dict[str, Any], expiry_seconds: int = JWT_DEFAULT_EXPIRY_SECONDS) -> str:
    """Haqiqiy HMAC-SHA256 raqamli imzolangan JWT token yaratadi"""
    now = int(time.time())
    full_payload = {
        **payload,
        "iat": now,
        "exp": now + expiry_seconds
    }
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    header_b64 = _b64_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _b64_encode(json.dumps(full_payload, separators=(',', ':')).encode('utf-8'))
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(JWT_SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64_encode(signature)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """JWT imzosini va amal qilish muddatini qat'iy tekshiradi"""
    if not token or token.count('.') != 2:
        return None
    try:
        header_b64, payload_b64, sig_b64 = token.split('.')
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(JWT_SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        provided_sig = _b64_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, provided_sig):
            return None
        payload_bytes = _b64_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
        now = int(time.time())
        if "exp" in payload and payload["exp"] < now:
            return None  # Token muddati tugagan
        return payload
    except Exception:
        return None

# ==========================================
# 3. AVTORIZATSIYA VA RUXSATLARNI TEKSHIRISH
# ==========================================

def extract_token_from_header(auth_header: Optional[Any]) -> Optional[str]:
    """Authorization: Bearer <token> sarlavhasidan tokenni ajratadi"""
    if not auth_header or not isinstance(auth_header, str):
        return None
    parts = auth_header.strip().split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    if len(parts) == 1:
        return parts[0]
    return None

def get_current_user_from_request(
    request: Request,
    authorization: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    So'rovdan foydalanuvchini aniqlaydi.
    Token topilsa va haqiqiy bo'lsa, xodim profilini qaytaradi.
    """
    auth_header = authorization if isinstance(authorization, str) else (
        request.headers.get("authorization") if hasattr(request, "headers") else None
    )
    token = extract_token_from_header(auth_header)
    if not token and hasattr(request, "headers"):
        token = request.headers.get("x-auth-token")

    if not token:
        return None

    payload = decode_jwt_token(token)
    return payload

def require_authenticated_user(request: Request) -> Dict[str, Any]:
    """Foydalanuvchi tizimga kirganligini majburiy tekshiradi (401 xatolik)"""
    auth_header = request.headers.get("authorization")
    user = get_current_user_from_request(request, auth_header)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tizimga kirilmagan yoki seans muddati tugagan. Iltimos, qayta kiring."
        )
    return user

def require_roles_any(user_roles: List[str], allowed_roles: List[str]) -> bool:
    """Xodim berilgan rollarning kamida bittasiga ega ekanligini tekshiradi"""
    norm_user = {r.upper() for r in user_roles}
    norm_allowed = {r.upper() for r in allowed_roles}
    return bool(norm_user.intersection(norm_allowed))
