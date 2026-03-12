require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for PDF upload
const upload = multer({ storage: multer.memoryStorage() });

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.ANTHROPIC_API_KEY); // Reusing the env var for convenience or you can rename it
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const resumeFile = req.file;

    if (!resumeFile || !jobDescription) {
      return res.status(400).json({ error: 'Missing resume or job description' });
    }

    // Extract text from PDF
    const data = await pdf(resumeFile.buffer);
    const resumeText = data.text;

    // Gemini API Prompt
    const prompt = `Compare this resume with the job description. 
Return ONLY JSON in this format: {"score": number, "matched": [], "missing": [], "tips": []}

Resume:
${resumeText}

Job Description:
${jobDescription}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON from AI's response
    // Sometimes AI wraps JSON in markdown blocks
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    try {
      const resultJson = JSON.parse(cleanJson);
      res.json(resultJson);
    } catch (parseError) {
      console.error('JSON Parse Error:', responseText);
      res.status(500).json({ error: 'Failed to parse AI response' });
    }

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: 'Internal server error during analysis. Check your API key and quota.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
