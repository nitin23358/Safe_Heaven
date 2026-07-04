# SafeHaven Delhi

Women's safety platform for Delhi with **real DMRC metro data** (251 stations), **Haversine geospatial recommendations**, **OpenStreetMap POIs**, and **ML safety scoring**.

## Live Demo

> Deploy to Render for a single review link — see [Deploy](#deploy-one-link) below.

**Demo login (offline mode):**
- Email: `demo@safehaven.com`
- Password: `demo123`

## Features

- Delhi area safety analyzer with ML score (0–100)
- Safety Index: crime, lighting, crowd density, overall score
- Nearest metro / police / café / hospital (Haversine distance + walk time)
- Route risk planner with Leaflet maps
- Crime reports, community reviews, safe zones
- 251 DMRC metro stations from GTFS dataset

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Leaflet, Framer Motion |
| Backend | Node.js, Express, JWT |
| Database | MySQL (optional — offline mock fallback) |
| ML | Python scikit-learn Random Forest |
| Data | DMRC GTFS, OpenStreetMap Overpass API |

## Run Locally

### Terminal 1 — Backend
```bash
cd backend
npm install
npm start
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

## MySQL Setup (Optional)

```sql
-- Run in order in MySQL:
source db-mysql/delhi_schema.sql
source db-mysql/delhi_data.sql
source db-mysql/delhi_geo_schema.sql
source db-mysql/metro_stations_data.sql
```

Copy `backend/.env.example` to `backend/.env` and set your MySQL password.

## Deploy (One Link)

### Render (Recommended — Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Blueprint**
3. Connect your GitHub repo — it reads `render.yaml` automatically
4. Deploy → you get one URL like `https://safehaven-delhi.onrender.com`

The backend serves the React build in production, so reviewers use **one link** for the full app.

## Project Structure

```
backend/          Express API + metro/POI services
frontend/         React SPA
db-mysql/         SQL schemas + seed data
ml/               Python ML model
backend/data/     metro_stations.json (251 DMRC stations)
```

## Author

[Nitin](https://github.com/nitin23358)
