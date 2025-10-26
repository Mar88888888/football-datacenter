# Football Datacenter

Football Datacenter - це веб-додаток для зберігання та відображення даних про футбольні змагання, команди, гравців та тренерів. Використовуючи Football-Data API, додаток автоматично отримує та зберігає інформацію про футбольні ліги, команди, гравців та тренерів у базу даних PostgreSQL.

## Зміст

- [Структура проєкту](#структура-проєкту)
- [Налаштування](#налаштування)
- [Запуск](#запуск)
- [API](#api)
- [Авторизація](#авторизація)
- [Особливості](#особливості)

## Структура проєкту

```plaintext
football-datacenter/
├── Server/                 # Серверна частина (Nest.js API)
│   ├── src/
│   │   ├── users/           # Модуль для управління користувачами
│   │       ├── auth/        # Модуль управління авторизацією та реєстрацією
│   │       ├── favourites/  # Модуль управління обраним
│   │   ├── competitions/    # Модуль для змагань
│   │   ├── teams/           # Модуль для команд
│   │   ├── matches/         # Модуль для матчів
│   │   ├── standings/          # Модуль для турнірних таблиць
│   │   └── ...              # Інші файли та конфігурації
│   ├── main.ts              # Головний файл запуску сервера
│   └── ...
├── Client/                 # Клієнтська частина (React)
│   ├── src/
│   │   ├── components/      # React-компоненти
│   │   ├── pages/           # Сторінки
│   │   ├── contexts/        # Контексти для глобального стану
│   │   ├── styles/          # CSS стилі
│   │   └── App.js           # Головний файл додатка
│   └── ...
└── README.md                # Документація проєкту
```

## Налаштування

Клонування репозиторію:

```plaintext
git clone https://github.com/Mar88888888/football-datacenter.git
cd football-datacenter
```

Backend (Nest.js):

Перейдіть до каталогу backend:

```plaintext
cd Server
```

Встановіть залежності:

```plaintext
npm install
```

Створіть файл .env та налаштуйте змінні середовища:

```plaintext
- SMTP_HOST: SMTP server address
- SMTP_PORT: SMTP server port
- SMTP_USER: SMTP login username
- SMTP_PASS: SMTP login password
- JWT_SECRET: Secret key for JWT authentication
```

Frontend (React):

Перейдіть до каталогу frontend:

```plaintext
cd ../Client
```

Встановіть залежності:

```plaintext
npm install
```

Створіть файл .env на основі .env.example та налаштуйте змінні середовища, такі як REACT_APP_API_URL для звернень до API.

## Запуск

Режим розробки

Запуск Backend:

```plaintext
cd Server
npm run start:dev
```

Запуск Frontend:

```plaintext
cd Client
npm start
```

Режим продакшн
Backend:

```plaintext
cd Server
npm run build
npm run start:prod
```

Frontend:
Зібрати додаток для продакшн:

```plaintext
cd Client
npm run build
```

Сервер розгортання зібраних файлів з frontend/build (наприклад, використовуючи сервіс на зразок Nginx або сервера статичних файлів).

## API

Проєкт реалізує REST API для роботи з даними про змагання, команди, гравців та тренерів.

```plaintext
GET /competition/search/:name: Search competitions by name.
GET /competition/:id: Retrieve competition by ID.

GET /matches: Get matches, optionally by date and limit.
GET /matches/my/:userId: Get matches for a specific user.
GET /matches/live: Retrieve live matches.
GET /matches/forteam/:teamid: Get matches for a specific team, optionally by date, status, and limit.
GET /matches/forcomp/:compid: Get matches for a competition, with optional previous matches and limit.

GET /standings/:id: Retrieve league table by league ID.

GET /teams/search/:name: Search teams by name.
GET /teams/:id: Retrieve team by ID.

GET /user: Retrieve users, optionally by email.
GET /user/auth/bytoken: Get user by token in request header.
GET /user/auth/whoami: Get current authenticated user.
GET /user/auth/verify-email: Verify email by token.
POST /user/auth/signout: Sign out and clear authentication cookie.
POST /user/auth/signup: Register a new user.
POST /user/auth/signin: Log in an existing user.
GET /user/favteam: Get favorite teams for current user.
GET /user/favcomp: Get favorite competitions for current user.
POST /user/favteam/:teamid: Add team to user's favorites.
POST /user/favcomp/:compid: Add competition to user's favorites.
DELETE /user/favcomp/:compid: Remove competition from user's favorites.
DELETE /user/favteam/:teamid: Remove team from user's favorites.
GET /user/:id: Retrieve user by ID.
PATCH /user/:id: Update user information by ID.
```

## Авторизація

Проєкт використовує JWT для аутентифікації користувачів. Користувачі можуть реєструватися, входити в систему, а також отримувати доступ до захищених маршрутів після входу.

POST /api/auth/signup - Реєстрація нового користувача.
POST /api/auth/signin - Вхід користувача.
Приклад даних авторизації всередині body:

```plaintext
{
  "name": "User name",
  "email": "user email",
  "password": "user password"
}
```

## Особливості

Автоматичне оновлення даних: автоматичний збір та оновлення даних про змагання, команди, гравців і тренерів кожного тижня.
Інтерактивний інтерфейс: користувачі можуть переглядати дані про змагання та команди, додавати улюблені змагання та команди.

## Розподіл завдань команди

Artem Marchenko - Fullstack
Oleskandr Vershygora - Backend
Vladyslava Figol - QA
Stankova Iryna - QA
