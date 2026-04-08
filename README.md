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
- `GET /api/auth/bootstrap-status`
- `POST /api/auth/bootstrap-admin`
- `POST /api/auth/commissionerate/login`
- `GET /api/admin/commissionerate`
- `POST /api/admin/commissionerate`
- `GET /api/dashboard/complaints`

The server runs from the repository root with:

```bash
npm run dev
```

## 5. Dashboard authentication

```env
AUTH_TOKEN_SECRET=replace-with-a-long-random-secret
```

Dashboard users are stored only in MongoDB. `.env` no longer contains admin or commissionerate usernames and passwords.

Create the first admin account with `POST /api/auth/bootstrap-admin`, then use the admin dashboard to create or update commissionerate accounts. Commissionerate passwords are stored as bcrypt hashes in MongoDB, and commissionerate users can only see complaints assigned to their own commissionerate.
