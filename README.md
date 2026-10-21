# StoreRate - Store Rating Web Application (MERN)

A full-stack web app where users rate stores from 1 to 5 stars and store owners see who rated their store.
Built for the **NexaPrime Full Stack Developer Internship Coding Challenge**.

It was converted from my PHP "Wanderlust" hotel-booking project. The design (CSS, navbar, footer, cards, star widget)
and the simple coding style were kept; hotel listings became stores and hotel reviews became star ratings.

## Technologies

| Part | Technology |
|------|------------|
| Frontend | React (Vite), React Router, Axios, Bootstrap 5 + the original custom CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Atlas) with Mongoose |
| Auth | JWT + bcryptjs |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## Features

**Normal user (`user` role)**
- Register (name, email, address, password and role: Customer or Store Owner), log in, log out
- Customer dashboard: all stores as cards with name, address and average rating; search by name
- Click a store card to open its details page: description, average rating and every submitted rating
- On the details page, submit a 1-5 star rating, and edit it later
- Clear validation and error messages

**Store owner (`owner` role)**
- Register as a Store Owner (or use a seeded owner account) and log in
- Owner dashboard: all of their stores as cards with average ratings
- "Add New Store" in the navbar: a form that creates a store (it then appears in the customers' list too)
- Click a store card to see its details and the raters (name, email, rating), and edit the store information
- Owners can read ratings but cannot add them, and can only edit their own stores

**Validation (backend + matching frontend)**
- Name 20-60 characters, address max 400, valid email
- Password 8-16 characters with at least one uppercase letter and one special character
- Rating is a whole number from 1 to 5
- One rating per user per store (unique index in MongoDB); submitting again updates it

## Folder structure

```
server/
  config/db.js                 MongoDB connection
  models/                      User.js, Store.js, Rating.js
  controllers/                 authController, storeController, ratingController, ownerController
  routes/                      authRoutes, storeRoutes, ratingRoutes, ownerRoutes
  middleware/                  authMiddleware.js (JWT), roleMiddleware.js (roles)
  utils/                       validators.js, ratingStats.js (average calculation)
  scripts/                     seed.js (sample data), smoke-test.js (API tests)
  server.js
  .env.example
client/
  src/components/              Navbar, Footer, StoreCard, StarRating, Alert, Loader, ProtectedRoute
  src/pages/                   Login, Register, StoreList, OwnerDashboard, InfoPages, NotFound
  src/context/AuthContext.jsx  login state shared by the whole app
  src/services/api.js          Axios setup (base URL, token header, expired-session handling)
  src/utils/validators.js      same rules as the backend
  src/styles/                  style.css + rating.css (from the original project), store.css (new)
  vercel.json                  makes React Router URLs work on Vercel
```

### How the old hotel project maps to the new one

| Old (PHP / MySQL) | New (MERN) |
|---|---|
| `users` table | `User` model (+ name, address, role) |
| `listings` table | `Store` model (`ownerId` replaces `user_id`) |
| `reviews` table | `Rating` model (stars only, one per user per store) |
| `layout.php` navbar/footer | `Navbar.jsx`, `Footer.jsx` |
| `listings/index.php` cards | `StoreList.jsx` + `StoreCard.jsx` |
| starability review form | `StarRating.jsx` (same `rating.css`) |
| `login.php`, `signup.php` | `Login.jsx`, `Register.jsx` |
| PHP sessions + CSRF | JWT token (sent in the `Authorization` header) |
| `require_login()` | `protect` middleware, `allowRoles()` and `ProtectedRoute` |
| Booking, price, image upload, tax toggle, comments | Removed (not needed) |

## Local setup

Requirements: Node.js 18+ and a free MongoDB Atlas cluster.

### 1. MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/atlas.
2. **Database Access** -> add a database user (username + password).
3. **Network Access** -> add your current IP (use `0.0.0.0/0` for deployment, see below).
4. **Connect -> Drivers** -> copy the connection string and put your database name in it, e.g. `.../store_rating?retryWrites=true&w=majority`.

### 2. Backend
```bash
cd server
npm install
cp .env.example .env      # then edit .env and fill in the values
npm run seed              # creates sample data (it CLEARS users, stores and ratings first)
npm run dev               # http://localhost:5000
```

### 3. Frontend
```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

### Environment variables

| File | Variable | Meaning |
|------|----------|---------|
| `server/.env` | `MONGO_URI` | Atlas connection string |
| `server/.env` | `JWT_SECRET` | long random string used to sign tokens |
| `server/.env` | `CLIENT_URL` | frontend URL allowed by CORS (comma separated for several) |
| `server/.env` | `PORT` | optional, defaults to 5000 (Render sets it automatically) |
| `client/.env` | `VITE_API_URL` | backend URL ending in `/api` |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Test accounts (created by `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| user | `user@example.com` | `User@1234` |
| user | `user2@example.com`, `user3@example.com` | `User@1234` |
| owner | `owner1@example.com` (Nagpur Electronics Hub) | `Owner@1234` |
| owner | `owner2@example.com` ... `owner5@example.com` (one store each) | `Owner@1234` |

These only exist after you run the seed script against your own database. Change or remove them before real use.

## Testing

With the server running and the database seeded:
```bash
cd server
npm test        # 77 API checks: validation, auth, roles, ratings, averages, owner privacy
```
To test a deployed backend: `API_URL=https://your-backend.onrender.com npm test` (the seed data must exist there).

## API documentation

Base URL: `http://localhost:5000/api`. Send `Authorization: Bearer <token>` on protected routes.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/health` | public | Health check, returns `{ "status": "ok" }` |
| POST | `/auth/register` | public | Body: `name, email, address, password, role` (`"user"` = customer or `"owner"`). Returns `token` + `user` |
| POST | `/auth/login` | public | Body: `email, password`. Returns `token` + `user` |
| GET | `/auth/me` | logged in | Returns the current user (used to restore a login on page refresh) |
| GET | `/stores?search=text` | logged in | All stores with `averageRating`, `ratingCount`, `myRating` |
| GET | `/stores/:id` | logged in | Store details + all ratings (raters' emails only for the store's owner) |
| POST | `/stores` | owner | Body: `name, address, description?`. Adds a store owned by me |
| PUT | `/stores/:id` | owner | Edit my own store's `name, address, description` (403 for other owners) |
| GET | `/ratings/my` | user | All ratings submitted by me |
| PUT | `/ratings/:storeId` | user | Body: `{ "rating": 1-5 }`. Creates the first rating, updates later ones |
| GET | `/owner/dashboard` | owner | All my stores with average rating and counts, plus totals |
| GET | `/owner/ratings` | owner | Who rated any of my stores: store, name, email, rating |

Errors return `{ "message": "..." }` with status 400 (invalid input), 401 (not logged in / expired), 403 (wrong role), 404 (not found), 409 (duplicate).

## Deployment

Deploy in this order: **Atlas -> Render -> Vercel -> update Render's CORS value**.

### 1. MongoDB Atlas
- Network Access -> **Add IP Address -> Allow access from anywhere (`0.0.0.0/0`)**. Render's free plan has no fixed IP.
- Run the seed once from your computer, with `MONGO_URI` in `server/.env` pointing to Atlas: `npm run seed`.

### 2. Backend on Render
1. Push this repo to GitHub.
2. Render -> **New -> Web Service** -> connect the repo.
3. Settings: **Root Directory** `server`, **Build Command** `npm install`, **Start Command** `npm start`.
4. **Environment** variables: `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (use `http://localhost:5173` for now).
5. Under Advanced, set **Health Check Path** to `/api/health`.
6. After deploy, open `https://<your-app>.onrender.com/api/health`. It should show `{"status":"ok"}`.

The free plan sleeps after inactivity, so the first request can take about 30-60 seconds.

### 3. Frontend on Vercel
1. Vercel -> **Add New -> Project** -> import the same repo.
2. **Root Directory** `client`. Framework preset: Vite (build `npm run build`, output `dist`).
3. **Environment Variables**: `VITE_API_URL` = `https://<your-app>.onrender.com/api`.
4. Deploy. `vercel.json` makes direct links such as `/stores` work after a refresh.

### 4. Connect them
Go back to Render -> Environment -> set `CLIENT_URL` to your Vercel URL (no trailing slash, e.g. `https://my-store-rating.vercel.app`) and save. Render redeploys. Then log in on the Vercel site with a seeded account.

## Links

- GitHub: https://github.com/Vishal-hub-27/Store-Rating-Web-Application_
- Frontend (Vercel): https://vercel.com/vishal-chougale/store-rating-web-application
- Backend (Render): https://dashboard.render.com/web/srv-dbc1gb9srm7s739aolfg

## Security notes
- Passwords are hashed with bcryptjs and never returned by the API.
- The sign-up role is checked on the server: only `user` or `owner` is accepted (nothing like `admin`).
- A user's rating is always saved under the user id inside the JWT, so nobody can change another user's rating.
- Owner routes use the logged-in owner's id from the token, and editing a store checks that the store belongs to that owner.
- Secrets live in `.env` files, which are git-ignored.
