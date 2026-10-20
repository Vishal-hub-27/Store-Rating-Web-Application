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
npm test        # 51 API checks: validation, auth, roles, ratings, averages, owner privacy
```
To test a deployed backend: `API_URL=https://your-backend.onrender.com npm test` (the seed data must exist there).

## API documentation

Base URL: `http://localhost:5000/api`. Send `Authorization: Bearer <token>` on protected routes.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/health` | public | Health check, returns `{ "status": "ok" }` |
| POST | `/auth/register` | public | Body: `name, email, address, password`. Always creates a `user`. Returns `token` + `user` |
| POST | `/auth/login` | public | Body: `email, password`. Returns `token` + `user` |
| GET | `/auth/me` | logged in | Returns the current user (used to restore a login on page refresh) |
| GET | `/stores?search=text` | logged in | All stores with `averageRating`, `ratingCount`, `myRating` |
| GET | `/stores/:id` | logged in | One store (same fields) |
| GET | `/ratings/my` | user | All ratings submitted by me |
| PUT | `/ratings/:storeId` | user | Body: `{ "rating": 1-5 }`. Creates the first rating, updates later ones |
| GET | `/owner/dashboard` | owner | My store's name, address, average rating, rating count |
| GET | `/owner/ratings` | owner | Who rated my store: name, email, rating |

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

- GitHub: _add your repository URL_
- Frontend (Vercel): _add after deployment_
- Backend (Render): _add after deployment_

## Security notes
- Passwords are hashed with bcryptjs and never returned by the API.
- The role is never read from the sign-up request, so nobody can register as an owner.
- A user's rating is always saved under the user id inside the JWT, so nobody can change another user's rating.
- Owner routes look up the store by the logged-in owner's id, not by an id from the URL.
- Secrets live in `.env` files, which are git-ignored.
