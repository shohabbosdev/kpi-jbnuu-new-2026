FROM python:3.11-slim

# Muhit o'zgaruvchilari
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Tizim paketlarini yangilash
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Bog'liqliklarni o'rnatish
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Loyiha kodini ko'chirish
COPY . .

# Yuklangan fayllar katalogini yaratish
RUN mkdir -p /app/uploads

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
