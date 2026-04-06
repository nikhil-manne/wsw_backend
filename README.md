# Backend Setup

## 1. Create `.env`

Copy `.env.example` to `.env` and add your MongoDB credentials.

Example:

```env
PORT=4000
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/complaints-db?retryWrites=true&w=majority
DB_NAME=complaints-db
CORS_ORIGIN=*
```

## 2. Install dependencies

```bash
npm install
```

## 3. Start the backend

```bash
npm run dev
```

or

```bash
npm start
```

## 4. API endpoints

- `GET /api/health`
- `POST /api/complaints`
- `POST /api/auth/login`
- `GET /api/dashboard/complaints`

The server runs from the repository root with:

```bash
npm run dev
```

## 5. Dashboard credentials in `.env`

Set one admin login and one login for each commissionerate:

```env
AUTH_TOKEN_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
HYDERABAD_USERNAME=hyderabad_user
HYDERABAD_PASSWORD=change-me
CYBERABAD_USERNAME=cyberabad_user
CYBERABAD_PASSWORD=change-me
MALKAJGIRI_USERNAME=malkajgiri_user
MALKAJGIRI_PASSWORD=change-me
FUTURE_CITY_USERNAME=futurecity_user
FUTURE_CITY_PASSWORD=change-me
```

Commissionerate users can only see complaints assigned to their own commissionerate. Admin can see every complaint.
