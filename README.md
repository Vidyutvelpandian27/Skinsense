# SkinSense

SkinSense is a React/Vite frontend and a Flask API. The API uses MongoDB and
performs image analysis in Python.

## Project layout

- `frontend/` — React app built with Vite
- `backend/` — Flask API, MongoDB access, and image-analysis code
- `backend/database/` — MongoDB connection helpers and legacy SQL reference
- `frontend/public/` — static assets served with the frontend

The frontend and backend are separate deployable services. Vercel can host the
static frontend; the current Flask image-analysis API should be deployed as a
separate Python web service. MongoDB must also be reachable over the internet,
for example through MongoDB Atlas. The local MongoDB service at
`mongodb://localhost:27017` is not accessible to cloud deployments.

## Local development

Run the API from the `backend/` directory:

```powershell
Copy-Item .env.example .env
# Edit .env with your local settings.
..\.venv\Scripts\python.exe -m database.ensure_reports_columns
..\.venv\Scripts\python.exe app.py
```

Run the frontend in a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

If your Python environment is not at the project root in `.venv`, use its
Python executable instead. Do not commit `.env` or files in `backend/uploads/`.

## Deploy the frontend to Vercel

1. Push this repository to GitHub.
2. In Vercel, import the repository and set **Root Directory** to `frontend`.
3. Use the Vite framework preset, build command `npm run build`, and output
   directory `dist`.
4. Add the environment variable `VITE_API_URL` for Production, Preview, and
   Development. Set it to the deployed API base URL ending in `/api`, for
   example `https://your-api.example.com/api`.
5. Deploy. `frontend/vercel.json` provides SPA routing for React Router paths.

The frontend's local API fallback is `http://localhost:5000/api`; it must be
overridden with `VITE_API_URL` for a deployed site.

## Deploy the API

Deploy `backend/` to a Python web-service host that supports Flask, the
dependencies in `backend/requirements.txt`, and persistent file storage. Set
these variables in the hosting provider's private environment settings:

- `MONGODB_URI` — MongoDB Atlas connection string
- `MONGODB_DATABASE` — for example `skinsense`
- `SECRET_KEY` — a long, random secret unique to the deployment
- `FLASK_DEBUG` — `false`
- `ADMIN_EMAIL` — optional email to receive the admin role when registering
- `FRONTEND_URL` — the deployed Vercel origin
- `UPLOAD_FOLDER` — a persistent storage path if uploaded analysis images
  should remain available after service restarts

Configure Atlas Network Access to allow connections from the API host. Do not
put the MongoDB URI or secret key in frontend variables or commit them to Git.
The API currently saves uploaded and processed images to local files; ephemeral
server storage can lose them on restart, so configure persistent storage or
move images to object storage before relying on saved analysis images in
production. The host must also permit long-running image-analysis requests.

## Checks

Frontend production build:

```powershell
cd frontend
npm ci
npm run build
```

Backend tests, from the project root using the configured Python environment:

```powershell
.\.venv\Scripts\python.exe -m pytest backend\tests -q
```
