"""
O'zMU JBNUU KPI Axborot Tizimi - Telegram Xabarnomalar Xizmati (Asinxron)
- O'qituvchilar arizalari baholanganda shaxsiy bot xabari
- Kafedra mudirlariga yangi sillabus/ishchi dastur yuklanganda tezkor ogohlantirish
- Apellyatsiya natijalari va kengash qarorlari
- Asinxron fonda (non-blocking) ishlash kafolatlangan
"""

import threading
import requests
import html
from typing import Optional, Dict, Any
from database import db_load_settings, db_get_user_telegram_chat_id

def _send_telegram_http_request(token: str, chat_id: str, text: str, parse_mode: str = "HTML"):
    """Ichki yordamchi funksiya: Telegram Bot API orqali xabar yuborish (timeout 5s)"""
    if not token or not chat_id:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True
    }
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        # Xabarnoma yuborilmasa ham asosiy tizim to'xtamasligi kerak
        print(f"[TELEGRAM NOTIFICATION ERROR] {e}")

def send_telegram_async(chat_id: str, text: str):
    """Xabarni asosiy so'rovni to'xtatib qo'ymaslik uchun alohida oqimda (thread) yuboradi"""
    if not chat_id:
        return
    settings = db_load_settings() or {}
    token = settings.get("telegram_bot_token")
    if not token or not settings.get("telegram_notifications_enabled"):
        return

    t = threading.Thread(
        target=_send_telegram_http_request,
        args=(token, chat_id, text),
        daemon=True
    )
    t.start()

def send_admin_channel_async(text: str):
    """Admin yoki universitet KPI kanaliga xabar yuboradi"""
    settings = db_load_settings() or {}
    token = settings.get("telegram_bot_token")
    channel_id = settings.get("telegram_channel_id")
    if not token or not channel_id or not settings.get("telegram_notifications_enabled"):
        return

    t = threading.Thread(
        target=_send_telegram_http_request,
        args=(token, channel_id, text),
        daemon=True
    )
    t.start()

# =============================================================
# Shaxsiy xabarnomalar shablonlari (HTML)
# =============================================================

def notify_submission_evaluation(teacher_username: str, teacher_name: str, indicator_name: str, status: str, score: float, comment: str = ""):
    """O'qituvchi arizasi baholanganda (tasdiqlanganda yoki rad etilganda)"""
    chat_id = db_get_user_telegram_chat_id(teacher_username)
    status_icon = "✅ TASDIQLANDI" if status.upper() == "APPROVED" else "❌ RAD ETILDI"
    
    msg = (
        f"<b>🏛 OʻzMU JBNUU KPI Tizimi</b>\n\n"
        f"Hurmatli <b>{html.escape(teacher_name)}</b>,\n"
        f"Sizning KPI arizangiz ekspert komissiyasi tomonidan koʻrib chiqildi.\n\n"
        f"📌 <b>Mezon:</b> {html.escape(indicator_name)}\n"
        f"📊 <b>Natija:</b> {status_icon}\n"
        f"⭐️ <b>Berilgan ball:</b> {score} ball\n"
    )
    if comment:
        msg += f"💬 <b>Izoh:</b> <i>{html.escape(comment)}</i>\n"
    
    msg += f"\n🔗 Batafsil koʻrish: https://jbnuu.uz/kpi/"
    
    if chat_id:
        send_telegram_async(chat_id, msg)
    send_admin_channel_async(msg)

def notify_new_course_doc_uploaded(teacher_name: str, subject_name: str, doc_type: str, doc_title: str, department_name: str, mudir_username: Optional[str] = None):
    """Kafedra mudiriga yangi o'quv-uslubiy hujjat yuklanganida ogohlantirish"""
    mudir_chat_id = db_get_user_telegram_chat_id(mudir_username) if mudir_username else None
    
    msg = (
        f"<b>📚 Yangi fan hujjati yuklandi</b>\n\n"
        f"Kafedra: <b>{html.escape(department_name or 'Kafedra')}</b>\n"
        f"Pedagog: <b>{html.escape(teacher_name)}</b>\n"
        f"Fan: <b>{html.escape(subject_name)}</b>\n"
        f"Hujjat turi: <b>{html.escape(doc_type)}</b>\n"
        f"Sarlavha: {html.escape(doc_title)}\n\n"
        f"⚠️ Kafedra mudiri tomonidan tasdiqlanishi kutilmoqda.\n"
        f"🔗 Tasdiqlash: https://jbnuu.uz/kpi/"
    )
    if mudir_chat_id:
        send_telegram_async(mudir_chat_id, msg)
    send_admin_channel_async(msg)

def notify_appeal_filed(teacher_name: str, indicator_name: str, reason: str):
    """Yangi apellyatsiya tushganda komissiyani ogohlantirish"""
    msg = (
        f"<b>⚖️ Yangi apellyatsiya arizasi!</b>\n\n"
        f"Pedagog: <b>{html.escape(teacher_name)}</b>\n"
        f"Mezon: <b>{html.escape(indicator_name)}</b>\n"
        f"Sabab: <i>{html.escape(reason[:250])}</i>\n\n"
        f"🔗 Koʻrib chiqish: https://jbnuu.uz/kpi/"
    )
    send_admin_channel_async(msg)
