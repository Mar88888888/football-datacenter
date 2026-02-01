# Football Datacenter

A full-stack web application for tracking football competitions, teams, matches, and standings. Built with React and NestJS, integrating with the Football-Data API to provide real-time football data.

## Features

- **Live Match Tracking** - Follow matches in real-time with live score updates
- **Competition Browser** - Explore leagues and tournaments from around the world
- **Team Profiles** - View detailed information about teams, including recent and upcoming matches
- **Standings Tables** - Access up-to-date league tables and group stage standings
- **User Favorites** - Save your favorite teams and competitions for quick access
- **Multiple Competition Formats** - Support for leagues, knockout tournaments, and group+knockout formats (e.g., Champions League)
- **Responsive Design** - Optimized for both desktop and mobile devices

## Tech Stack

### Backend

- **NestJS** - Node.js framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database
- **Redis** - Caching and job queues
- **BullMQ** - Background job processing
- **TypeORM** - Database ORM
- **JWT** - Secure authentication
- **Docker** - Containerized infrastructure
- **Jest** - Testing framework

### Frontend

- **React 18** - UI library
- **TypeScript** - Type-safe components
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Jest + React Testing Library** - Component testing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Football-Data API key ([Get one here](https://www.football-data.org/))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mar88888888/football-datacenter.git
   cd football-datacenter
   ```

2. **Start Infrastructure with Docker**

   ```bash
   cd Server
   docker-compose up -d
   ```

   This starts:
   | Service | Port | Description |
   |---------|------|-------------|
   | PostgreSQL | 5433 | Database |
   | Redis | 6379 | Cache |
   | pgAdmin | 5050 | Database GUI |

3. **Backend Setup**

   ```bash
   npm install
   ```

   Create a `.env` file in the Server directory:

   ```env
   # Database (matches docker-compose defaults)
   DB_HOST=localhost
   DB_PORT=5433
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=football-datacenter

   # Redis (optional, defaults to localhost:6379)
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # CORS
   CORS_ORIGIN=http://localhost:3001

   # Football Data API
   FOOTBALL_DATA_API_KEY=your_api_key
   ```

4. **Frontend Setup**

   ```bash
   cd ../Client
   npm install
   ```

   Create a `.env` file in the Client directory:

   ```env
   REACT_APP_API_URL=http://localhost:3000/fdc-api
   ```

### Running the Application

**Development Mode**

```bash
# Terminal 1 - Backend
cd Server
npm run start:dev

# Terminal 2 - Frontend
cd Client
npm start
```

The backend will run on `http://localhost:3000` and the frontend on `http://localhost:3001`.

**Accessing pgAdmin**

Navigate to `http://localhost:5050` and login with:

- Email: `admin@admin.com`
- Password: `admin`

**Production Build**

```bash
# Backend
cd Server
npm run build
npm run start:prod

# Frontend
cd Client
npm run build
```

### Running Tests

```bash
# Backend tests
cd Server
npm test

# Frontend tests
cd Client
npm test
```

## API Reference

All endpoints are prefixed with `/fdc-api`.

### Competitions

| Method | Endpoint                    | Description             |
| ------ | --------------------------- | ----------------------- |
| GET    | `/competitions`             | Get all competitions    |
| GET    | `/competitions/:id`         | Get competition details |
| GET    | `/competitions/:id/matches` | Get competition matches |

### Matches

| Method | Endpoint   | Description                                    |
| ------ | ---------- | ---------------------------------------------- |
| GET    | `/matches` | Get matches (query: `date`, `limit`, `offset`) |

### Standings

| Method | Endpoint                    | Description                     |
| ------ | --------------------------- | ------------------------------- |
| GET    | `/standings/:competitionId` | Get standings for a competition |

### Teams

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| GET    | `/teams/:id`         | Get team details |
| GET    | `/teams/:id/matches` | Get team matches |

### Users & Authentication

| Method | Endpoint                | Description                                   |
| ------ | ----------------------- | --------------------------------------------- |
| POST   | `/user/auth/signup`     | Register new user                             |
| POST   | `/user/auth/signin`     | User login                                    |
| POST   | `/user/auth/signout`    | User logout                                   |
| GET    | `/user/auth/whoami`     | Get current user (protected)                  |
| GET    | `/user/auth/bytoken`    | Get user by token                             |
| GET    | `/user/favteam`         | Get favorite teams (protected)                |
| GET    | `/user/favcomp`         | Get favorite competitions (protected)         |
| POST   | `/user/favteam/:teamid` | Add team to favorites (protected)             |
| POST   | `/user/favcomp/:compid` | Add competition to favorites (protected)      |
| DELETE | `/user/favteam/:teamid` | Remove team from favorites (protected)        |
| DELETE | `/user/favcomp/:compid` | Remove competition from favorites (protected) |
| GET    | `/user/:id`             | Get user by ID                                |
| PATCH  | `/user/:id`             | Update user                                   |

## Authentication

The application uses JWT (JSON Web Tokens) for secure authentication. Protected routes require a valid token in the Authorization header.

**Registration Request:**

```json
POST /user/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Login Request:**

```json
POST /user/auth/signin
{
  "email": "john@example.com",
  "password": "securepassword"
}
```
