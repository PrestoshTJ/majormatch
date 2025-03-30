// server/gemini.js
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mime = require("mime-types");
const fs = require("fs");
require('dotenv').config();

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: [],
  responseMimeType: "text/plain",
};

router.post('/', async (req, res) => {
  const { prompt } = req.body;
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(prompt);
    // Optionally process inline data if needed (e.g., writing files)
    res.json({ result: result.response.text() });
  } catch (error) {
    console.error('Error accessing Gemini:', error);
    res.status(500).json({ error: 'Error accessing Gemini' });
  }
});

module.exports = router;
