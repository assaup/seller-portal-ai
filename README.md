# Smart Showcase

Кабинет продавца в духе Авито: список объявлений, редактирование и AI-помощник, который пишет описание и оценивает цену.

**Демо:** https://smart-showcase.onrender.com
(бесплатный хостинг засыпает без запросов — первая загрузка может занять до минуты)

## Возможности

- Поиск, фильтр по категориям, сортировка и пагинация
- Фильтр «требуют доработок» — объявления с пустым описанием или характеристиками
- Редактирование с полями под категорию (авто / недвижимость / электроника), валидацией и черновиком в localStorage
- AI-генерация описания и анализ рыночной цены (Groq)

## Стек

- **Клиент:** React 19, TypeScript, Vite, react-router v7, SCSS Modules, свои хуки вместо react-query
- **Сервер:** Node.js, Express 5, TypeScript, PostgreSQL (`pg`, без ORM), Groq API
- **Инфраструктура:** Docker, Render (приложение), Neon (Postgres)

## Запуск

```bash
cp .env.example .env   # вписать GROQ_API_KEY
docker compose up --build
```

Приложение откроется на http://localhost:3001. Схема БД создаётся и заполняется из `server/src/db.json` при первом запуске.

Для разработки без Docker: `npm run dev` в `server/` (нужны `DATABASE_URL` и `GROQ_API_KEY` в `server/.env`) и в `client/`, клиент на http://localhost:5173.

## Переменные окружения

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Строка подключения к Postgres |
| `GROQ_API_KEY` | Ключ с [console.groq.com/keys](https://console.groq.com/keys); без него AI отвечает 503 |
| `GROQ_MODEL` | Модель Groq, по умолчанию `openai/gpt-oss-120b` |

## Деплой

Render подхватывает `render.yaml` (New → Blueprint), нужно указать `DATABASE_URL` из Neon и `GROQ_API_KEY`. Каждый пуш в `main` деплоится автоматически.
