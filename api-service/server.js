const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Stock search endpoint
app.get('/api/stocks/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`Searching for stocks: ${q}`);
    
    const response = await axios.get(`https://www.screener.in/api/company/search/?q=${encodeURIComponent(q)}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    console.log(`Search results for ${q}: ${response.data.length} items`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error searching stocks:', error.message);
    res.status(500).json({ 
      error: 'Failed to search stocks. Please try again.',
      details: error.message 
    });
  }
});

// Stock chart data endpoint
app.get('/api/stocks/:id/chart', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid stock ID is required' });
    }

    console.log(`Fetching chart data for stock ID: ${id}`);
    
    const response = await axios.get(
      `https://www.screener.in/api/company/${id}/chart/?q=Price-DMA50-DMA200-Volume&days=365&consolidated=true`,
      {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.datasets || response.data.datasets.length < 4) {
      return res.status(400).json({ error: 'Invalid stock data format' });
    }

    console.log(`Chart data fetched for stock ID: ${id}, datasets: ${response.data.datasets.length}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock chart:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch stock data. Please try again.',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Stock API Service running on port ${PORT}`);
  console.log(`📡 Stock search: http://localhost:${PORT}/api/stocks/search?q=tcs`);
  console.log(`📊 Stock chart: http://localhost:${PORT}/api/stocks/3365/chart`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});