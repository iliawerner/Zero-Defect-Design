# Zero Defect Design Assistant

Веб-приложение на Next.js для оценки UX/UI макетов с помощью Gemini 2.5 Pro. Поддерживает загрузку дизайн-системы в Vercel Blob, авторизацию и ведение истории оценок.

## Возможности

- Авторизация через NextAuth (Credentials Provider). По умолчанию доступен демо-логин `designer@example.com / design123`.
- Загрузка дизайн-системы (md, txt, pdf, doc) и изображений макетов в Vercel Blob Storage.
- Проверка входных данных с использованием Gemini: соответствие JSON макету и ясность бизнес-задачи.
- Пошаговая оценка макета (обзор, качество дизайна, доступность, дизайн-система) с последующей генерацией отчёта.
- Сохранение результатов в Vercel Blob и просмотр истории оценок.

## Подготовка окружения

1. Свяжите проект с Vercel и подтяните переменные окружения:
   ```bash
   vercel link
   vercel env pull
   ```
2. Убедитесь, что заданы переменные:
   - `Zero_Defect_Gemini` — API-ключ Gemini 2.5 Pro.
   - `NEXTAUTH_SECRET` — секрет NextAuth.
   - (опционально) `DEMO_USERS` — JSON-массив дополнительных пользователей.
3. Установите зависимости и запустите проект:
   ```bash
   npm install
   npm run dev
   ```

## Структура приложения

- `app/` — маршруты Next.js (App Router).
- `components/` — UI-компоненты.
- `lib/` — утилиты для Gemini, NextAuth и Vercel Blob.
- `app/api/` — API-роуты для авторизации, загрузок и оценок.

## Примечания

- Промпты для этапов оценки вынесены в `lib/evaluation.ts` как placeholders `[[PROMPT_*]]` и должны быть заполнены.
- Для корректной работы Vercel Blob требуется активированная базa данных Blob в проекте Vercel.
- Серверные роуты используют Node.js runtime (по умолчанию в Next.js) и требуют Node.js 18+ с поддержкой `fetch`.
- Файл `vercel.json` настраивает build command (`npm run build`) и Output Directory `.vercel/output`, поэтому не требуется ручная правка настроек проекта на Vercel.
