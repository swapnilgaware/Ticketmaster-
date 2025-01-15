const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const ticketRoutes = require('./routes/ticketRoutes');
require('dotenv').config();

const { Client } = require('@elastic/elasticsearch');
const promClient = require('prom-client'); // For Prometheus metrics

const app = express();

// Elasticsearch client configuration
const client = new Client({
  node: process.env.ELASTIC_URI || 'http://localhost:9200', // Use environment variable for flexibility
  auth: {
    username: process.env.ELASTIC_USERNAME || '', // Use environment variable for Elasticsearch username
    password: process.env.ELASTIC_PASSWORD || '', // Use environment variable for Elasticsearch password
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Prometheus Metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics(); // Collect default Node.js metrics

// Custom Prometheus Metric: HTTP Request Duration
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Histogram of HTTP request durations in seconds',
  labelNames: ['method', 'route', 'status'],
});

// Middleware to monitor HTTP request durations
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    end({ status: res.statusCode });
  });
  next();
});

// Metrics Endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.send(await promClient.register.metrics());
});

// Elasticsearch Health Check Endpoint
app.get('/api/health/elasticsearch', async (req, res) => {
  try {
    const health = await client.cluster.health();
    res.json({
      status: 'Elasticsearch is healthy',
      health,
    });
  } catch (error) {
    console.error('Elasticsearch Health Check Failed:', error);
    res.status(500).json({ error: 'Elasticsearch is not healthy' });
  }
});

// Use routes
app.use(
  '/api/tickets',
  (req, res, next) => {
    req.elasticClient = client; // Attach Elasticsearch client to requests
    next();
  },
  ticketRoutes
);

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
