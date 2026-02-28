require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const weatherRoutes = require('./routes/weather');
const recordRoutes = require('./routes/records');
const exportRoutes = require('./routes/export');
const youtubeRoutes = require('./routes/youtube');
const mapRoutes = require('./routes/map');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
// Allow multiple origins: local dev + any Vercel preview/production URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any Vercel deployment URL for this project
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/weather', weatherRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/map', mapRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Weather App API is running',
    author: 'Mrunal Kotkar',
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database Sync & Server Start ─────────────────────────────────────────────
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅  Database connection established successfully.');
    await sequelize.sync({ alter: true });
    console.log('✅  Database models synced.');
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌  Unable to connect to the database:', err.message);
    process.exit(1);
  }
})();
