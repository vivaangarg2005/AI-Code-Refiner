require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Gemini client
// Note: If you don't provide an API key, it will look for GEMINI_API_KEY in the environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Serve static frontend files if they exist (for production Docker deployment)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// API Endpoint to handle streaming completion
app.post('/api/explain', async (req, res) => {
    const { code, task } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    let prompt = '';
    if (task === 'explain') {
        prompt = `Explain the following code snippet in a very clear, concise, and professional manner:\n\n${code}`;
    } else if (task === 'refactor') {
        prompt = `Refactor the following code snippet to be more efficient and clean, and explain what you changed:\n\n${code}`;
    } else if (task === 'bugs') {
        prompt = `Find and explain any potential bugs or vulnerabilities in this code:\n\n${code}`;
    } else {
        prompt = `Analyze this code:\n\n${code}`;
    }

    try {
        // Set headers for Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Flush headers
        res.flushHeaders();

        // Use the new @google/genai library format
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert AI software engineer. Provide your responses in Markdown format. Be direct and helpful."
            }
        });

        // Stream chunks to the client
        for await (const chunk of responseStream) {
            if (chunk.text) {
                // Send JSON encoded chunk
                res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            }
        }

        // Close the stream
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Error generating content:', error);
        res.write(`data: ${JSON.stringify({ error: 'An error occurred while generating the explanation. Please check your API key.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

// For any other route, serve the React app (Client-side routing fallback)
app.use((req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
