FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copie os arquivos estáticos diretamente
COPY . .

# Copie a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
