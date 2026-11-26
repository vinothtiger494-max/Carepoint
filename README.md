# CarePoint — Hospital Appointment Booking System

Full-stack app: React (Vite) frontend + Node.js/Express/MongoDB backend with JWT auth.

## Features

- Patient register/login (JWT, bcrypt-hashed passwords)
- Find doctors with search + speciality filter
- Book appointments with date + time-slot selection (double-booking prevented)
- View & cancel own appointments
- Admin panel: manage doctors, view all appointments
- Responsive UI (mobile/tablet/desktop)

## Prerequisites

- Node.js 18+ and npm
- MongoDB — **optional**. If `MONGO_URI` is empty or `memory`, the server uses a built-in in-memory MongoDB (`mongodb-memory-server`), so no MongoDB install is required for local dev. On first run it downloads a `mongod` binary (~600 MB) unless a bundled copy exists at `server/mongodb-bin/` or you set `MONGOMS_SYSTEM_BINARY` to your own `mongod` executable.

## Setup

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure environment
cd ../server
cp .env.example .env   # then edit values if needed

# 3. Seed demo data (6 doctors + admin user)
npm run seed
```

Seeded admin credentials: `admin@carepoint.com` / `Admin@123`

## Run

Two terminals:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev        # or: npm start

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

Open http://localhost:5173

## Using a real MongoDB

Set `MONGO_URI` in `server/.env`:

```
MONGO_URI=mongodb://localhost:27017/carepoint
```

then restart the server and re-run `npm run seed`.

> **Production:** the in-memory MongoDB is disabled when `NODE_ENV=production`.
> `MONGO_URI` and `JWT_SECRET` are **required** in production — the server
> refuses to start without them.

## Production deployment

### 1. Database — MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Create a database user (Database Access) and add your IP to the IP
   Access List (`0.0.0.0/0` if your host uses dynamic IPs).
3. Copy the connection string and set it in `server/.env`:

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/carepoint?retryWrites=true&w=majority
```

### 2. Environment variables

**`server/.env`** (never commit this file):

```
NODE_ENV=production
PORT=5000                        # or let your platform inject PORT
MONGO_URI=mongodb+srv://...      # Atlas connection string
JWT_SECRET=<64-char random hex>  # node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
CLIENT_URL=https://yourdomain.com   # comma-separate multiple origins
SEED_ADMIN_PASSWORD=<strong-password>  # optional, changes seeded admin password
```

**`client/.env`** — only needed if the API lives on a different origin:

```
VITE_API_URL=https://api.yourdomain.com
```

Leave it empty/unset when the Express server serves the client build
(same-origin `/api`).

### 3. Build & run

```bash
cd client && npm ci && npm run build   # produces client/dist
cd ../server && npm ci
node index.js                            # NODE_ENV=production
```

When `client/dist` exists, the Express server serves the React app and
handles SPA routing automatically — a **single service** deployment.

### 4. Platform options

- **Single service (simplest):** deploy the whole repo to Railway, Render,
  Fly.io, etc. Set the env vars above; the start command is `node server/index.js`
  (working dir `server`) or add a root `package.json` script.
- **Split hosting:** host `client/dist` on Vercel/Netlify/Cloudflare Pages
  (set `VITE_API_URL` to your API URL at build time) and run `server/` on
  Render/Railway. Add the frontend domain to `CLIENT_URL` for CORS.

### 5. First deploy checklist

- [ ] `MONGO_URI` points to Atlas (not empty, not `memory`)
- [ ] `JWT_SECRET` is a long random string (not the example value)
- [ ] `CLIENT_URL` includes the real frontend domain
- [ ] `client npm run build` succeeds; `server` starts without errors
- [ ] Change the seeded admin password via `SEED_ADMIN_PASSWORD`
- [ ] `.env` files are git-ignored and were never committed

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/register | public |
| POST | /api/login | public |
| GET | /api/doctors?search=&speciality= | public |
| GET | /api/doctors/:id | public |
| GET | /api/doctors/:id/slots?date= | public |
| POST/PUT/DELETE | /api/doctors | admin |
| POST | /api/appointments | patient |
| GET | /api/appointments/my | patient |
| GET | /api/appointments | admin |
| PUT | /api/appointments/:id/cancel | owner/admin |

## Project structure

```
server/   Express API, Mongoose models, JWT middleware, seed script
client/   React + Vite SPA (pages, context, plain CSS)
```
