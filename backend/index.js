require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const recommendationRoutes = require('./routes/recommendation');

const app  = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// CORS — accept one or more comma-separated frontend origins
// ---------------------------------------------------------------------------
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // In production enforce the allow-list; in dev allow everything
      if (process.env.NODE_ENV === 'production' && allowedOrigins.length > 0) {
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: origin ${origin} not allowed`));
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api', recommendationRoutes);

// Health check — used by Render to verify the service is up
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Academic Pathway API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Academic Pathway backend running on http://localhost:${PORT}`);
});
