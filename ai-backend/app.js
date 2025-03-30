const express = require('express');
const cors = require('cors');
const geminiRouter = require('./gemini');

const app = express();
const port = 4001;

// Allow any origin for now (for dev purposes)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.use('/api/gemini', geminiRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
