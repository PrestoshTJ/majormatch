// server/app.js
const express = require('express');
const geminiRouter = require('./gemini');
const app = express();
const port = 4001;

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the Gemini API endpoint
app.use('/api/gemini', geminiRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
