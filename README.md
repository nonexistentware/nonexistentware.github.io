# The SNDBX - Local Development Guide

## Способы запуска сайта локально

### Способ 1: Live Server (VS Code) - Рекомендуется ⭐

Если у вас установлен VS Code с расширением Live Server:

1. Откройте папку проекта в VS Code
2. Кликните правой кнопкой на `index.html`
3. Выберите "Open with Live Server"
4. Сайт откроется в браузере на `http://127.0.0.1:5501` (или другом порту)

**Или используйте команду в терминале:**
```bash
# Если установлен Live Server глобально
live-server --port=5501
```

---

### Способ 2: Python HTTP Server

Если у вас установлен Python:

**Python 3:**
```bash
cd /Users/igormac/Documents/MyProjects\(WEB\)/nonexistentware.github.io
python3 -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

Затем откройте в браузере: `http://localhost:8000`

---

### Способ 3: Node.js http-server

Если у вас установлен Node.js:

1. Установите http-server глобально:
```bash
npm install -g http-server
```

2. Запустите сервер:
```bash
cd /Users/igormac/Documents/MyProjects\(WEB\)/nonexistentware.github.io
http-server -p 8000
```

Затем откройте в браузере: `http://localhost:8000`

---

### Способ 4: PHP встроенный сервер

Если у вас установлен PHP:

```bash
cd /Users/igormac/Documents/MyProjects\(WEB\)/nonexistentware.github.io
php -S localhost:8000
```

Затем откройте в браузере: `http://localhost:8000`

---

### Способ 5: npx serve (без установки)

Если у вас установлен Node.js (но не нужно устанавливать ничего глобально):

```bash
cd /Users/igormac/Documents/MyProjects\(WEB\)/nonexistentware.github.io
npx serve -p 8000
```

---

## Важные замечания

⚠️ **Не открывайте `index.html` напрямую в браузере** (через `file://`), так как:
- Модули ES6 могут не работать из-за CORS политики
- Абсолютные пути (`/style/index.css`) не будут работать правильно
- Firebase может иметь проблемы с локальными файлами

✅ **Всегда используйте HTTP сервер** для корректной работы сайта.

---

## Проверка работы

После запуска сервера убедитесь, что:
1. Главная страница загружается: `http://localhost:8000`
2. Стили применяются корректно
3. Firebase загружается (проверьте консоль браузера F12)
4. Toast-уведомления работают
5. Модальные окна открываются

---

## Troubleshooting

**Проблема:** Стили не загружаются
- Убедитесь, что используете HTTP сервер, а не открываете файл напрямую
- Проверьте пути в браузере (F12 → Network)

**Проблема:** Firebase не работает
- Проверьте консоль браузера на наличие ошибок
- Убедитесь, что у вас есть интернет-соединение (Firebase SDK загружается с CDN)

**Проблема:** CORS ошибки
- Это нормально при открытии файла напрямую (`file://`)
- Используйте HTTP сервер для решения проблемы

