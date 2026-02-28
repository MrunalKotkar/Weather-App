# WeatherWise — Full-Stack Weather Application

A full-stack weather application that lets you search for real-time weather by city, zip code, GPS coordinates, or landmark. Includes a 5-day forecast, interactive map, YouTube video integration, a database-backed records system with CRUD operations, and multi-format data export.

Built by **Mrunal Kotkar** as part of the [PM Accelerator](https://www.linkedin.com/school/pmaccelerator/) program.

---

## Features

- **Flexible location search** — supports city/town names, zip/postal codes, GPS coordinates (lat,lon), and landmarks
- **Current weather** — temperature, feels like, humidity, wind speed and direction, pressure, visibility, cloud cover, sunrise and sunset (displayed in the city's local timezone)
- **5-day forecast** — one card per day starting from tomorrow, with true daily high/low temperatures aggregated across all available 3-hour slots. Cards change color based on weather conditions (sunny, cloudy, rainy, stormy, snowy, etc.)
- **Interactive map** — pins the searched location using Leaflet and OpenStreetMap. No paid API required
- **YouTube videos** — fetches the top 6 YouTube videos related to the searched location and weather
- **Weather records (CRUD)** — save, edit, and delete weather records with a date range, notes, and auto-fetched weather data. Backed by a PostgreSQL database
- **Multi-format export** — download all saved records as JSON, XML, CSV, or PDF. All timestamps in UTC (ISO 8601)
- **Dark / Light theme** — toggle between themes, preference persisted in localStorage
- **Error handling** — clear error messages throughout the UI for invalid locations, API failures, and form errors

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL, Sequelize 6 ORM |
| Map | Leaflet.js, OpenStreetMap (Nominatim) |
| Export | json2csv, xmlbuilder2, PDFKit |
| Hosting (Frontend) | Vercel |
| Hosting (Backend + DB) | Railway |

---

## APIs Used

| API | Purpose |
|---|---|
| [OpenWeatherMap](https://openweathermap.org/api) — Current Weather API | Real-time weather data (temperature, humidity, wind, conditions) |
| [OpenWeatherMap](https://openweathermap.org/api) — 5-day Forecast API | 3-hour interval forecast data, aggregated per day |
| [OpenWeatherMap](https://openweathermap.org/api) — Geocoding API | Resolve city names and landmarks to lat/lon |
| [OpenWeatherMap](https://openweathermap.org/api) — Zip Code API | Resolve postal codes to lat/lon |
| [YouTube Data API v3](https://developers.google.com/youtube/v3) | Fetch top 6 videos related to location + weather |
| [OpenStreetMap Nominatim](https://nominatim.org/) | Reverse geocoding for GPS coordinate inputs (free, no key required) |

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | Set your Vercel URL here |
| Backend API | Railway | Set your Railway URL here |
| PostgreSQL | Railway (managed) | Injected via `DATABASE_URL` |

---

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or use Railway's public URL)

### 1. Clone the repo

```bash
git clone https://github.com/MrunalKotkar/Weather-App.git
cd Weather-App
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Fill in your keys in .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
OPENWEATHER_API_KEY=your_key_here
YOUTUBE_API_KEY=your_key_here
CLIENT_URL=http://localhost:5173

# Local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weather_app
DB_USER=postgres
DB_PASSWORD=your_password

# Or use a full connection string (Railway injects this automatically)
# DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### Frontend (`frontend/.env`)

```
# Only needed for production. Leave empty for local dev (Vite proxy handles it).
VITE_API_URL=https://your-railway-backend.up.railway.app
```

---

## Project Structure

```
Weather App/
├── backend/
│   ├── config/          # Sequelize database config
│   ├── controllers/     # Route handlers (weather, records, export, youtube, map)
│   ├── middleware/      # Global error handler
│   ├── models/          # WeatherRecord Sequelize model
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic (weatherService, youtubeService, mapService)
│   └── server.js        # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (11 total)
│   │   ├── services/    # Axios API calls (api.js)
│   │   ├── App.jsx      # Root component, theme management
│   │   └── index.css    # All styles with dark/light CSS variables
│   └── vercel.json      # Vercel deployment config
├── railpack.json        # Railway deployment config (Railpack 0.17+)
└── README.md
```

---

## Notes

- The OWM free tier provides a 5-day forecast window. Records saved with past dates will use current weather data as a reference value.
- Sunrise and sunset times are always shown in the searched city's local timezone (UTC offset sourced from OWM).
- All exported file timestamps are in UTC (ISO 8601).

---

## Author

**Mrunal Kotkar**
Built as part of the [PM Accelerator](https://www.linkedin.com/school/pmaccelerator/) program.
