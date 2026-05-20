# Dockerfile لتشغيل HERP في بيئة خادم (اختياري)
FROM nginx:alpine

# تثبيت الأدوات الأساسية
RUN apk add --no-cache nodejs npm

# نسخ ملفات HERP
COPY ./app /usr/share/nginx/html/app
COPY ./landing.html /usr/share/nginx/html/index.html
COPY ./manifest.json /usr/share/nginx/html/
COPY ./sw.js /usr/share/nginx/html/

# نسخ ملفات الإعدادات
COPY ./infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
