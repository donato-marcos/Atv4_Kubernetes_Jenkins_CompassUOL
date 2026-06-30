# ============================================
# Builder Alpine (musl) → para produção Alpine
# ============================================
FROM python:3.13-alpine3.23 AS builder-alpine

RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir \
    --no-warn-script-location \
    --no-compile \
    --prefix=/install \
    -r requirements.txt

# ============================================
# Estágio 2: Produção Alpine
# ============================================
FROM python:3.13-alpine3.23 AS production

# 1. Cria o usuário primeiro
RUN addgroup -g 1011 -S fatec && \
    adduser -u 1011 -S aluno -G fatec

# 2. Muda para o usuário não-root
USER aluno

# 3. WORKDIR cria /app com dono aluno:fatec automaticamente
WORKDIR /app

# 4. Copia dependências e código (já com permissões corretas)
COPY --from=builder-alpine /install /usr/local
COPY --chown=aluno:fatec . .

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "", "--port", "8000"]
