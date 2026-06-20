FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY --chown=nginx:nginx ./public .

RUN chmod -R 755 /usr/share/nginx/html

COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
