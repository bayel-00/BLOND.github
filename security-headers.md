# Защита и ускорение сайта BLOND на уровне сервера

Часть защиты (CSP-мета, валидация, honeypot, ограничение частоты, безопасный DOM) уже внутри сайта.
Ниже — то, что настраивается на хостинге. Заголовки сильнее мета-тегов: только они умеют `frame-ancestors`.

## 1. Apache (файл `.htaccess` рядом с `index.html`)

```apache
Options -Indexes
<FilesMatch "^\.">
  Require all denied
</FilesMatch>

<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com; frame-src https://yandex.ru https://yandex.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
</IfModule>

# Сжатие и кэш
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType text/css "access plus 7 days"
  ExpiresByType application/javascript "access plus 7 days"
  ExpiresByType text/html "access plus 10 minutes"
</IfModule>
```

## 2. Nginx (блок `server { ... }`)

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com; frame-src https://yandex.ru https://yandex.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;

autoindex off;
location ~ /\. { deny all; }

gzip on;
gzip_types text/css application/javascript image/svg+xml;
location ~* \.(webp|css|js)$ { expires 7d; add_header Cache-Control "public"; }
```

HSTS включайте только когда сайт уже стабильно открывается по HTTPS.

## 3. Форма записи — что важно знать

Сейчас форма **никуда не отправляет данные** (так было и в исходнике): после «Записаться» показывается экран успеха, и всё.
Когда подключите отправку (свой сервер, Telegram-бот, CRM), на стороне сервера обязательно:

- заново проверять все поля, дату и время (10:00–21:00, не в прошлом) — проверкам в браузере доверять нельзя;
- ограничить частоту запросов по IP (например, 5 в минуту);
- не собирать SQL/HTML из полей формы, экранировать при выводе в письма и админку;
- хранить токены и пароли только на сервере, не в `main.js`.

## 4. Чек-лист хозяйственных мер

- Включить двухфакторную защиту на хостинге, регистраторе домена и в почте.
- Использовать HTTPS (бесплатный Let's Encrypt обычно включается в панели хостинга).
- Регулярно делать резервные копии сайта.
- Не оставлять на сервере лишние файлы: `*.bak`, архивы, `.git`.
