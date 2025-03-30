import React, { useState } from 'react';

async function match(prompt) {
    let result
    console.log(prompt)
    
    try {
        const response = await fetch('http://localhost:3001/api/gemini', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });
          
      const data = await response.json();
      result = data.result;
      return result
    } catch (error) {
      console.error('Error fetching Gemini result:', error);
      let result = 'Error fetching result';
      return result
    }
};

export default match;
