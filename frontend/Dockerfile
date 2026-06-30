FROM nginx:stable-alpine3.23-slim

WORKDIR /usr/share/nginx/html

# Para HTML/CSS/JS estático:
COPY --chown=nginx:nginx ./public/ .

# Configura permissões de forma eficiente
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# Templates do Nginx com substituição de variáveis
COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
