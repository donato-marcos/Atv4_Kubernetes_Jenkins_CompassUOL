FROM nginx:stable-alpine3.23

WORKDIR /usr/share/nginx/html

# Para HTML/CSS/JS estático:
COPY --chown=nginx:nginx ./public/ .

# Configura permissões de forma eficiente
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# Templates do Nginx com substituição de variáveis
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Healthcheck para o orquestrador
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -I http://localhost || exit 1

EXPOSE 80
