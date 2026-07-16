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
    const strictGuardrail = "Strictly analyze the following input. If the input does not appear to be programming code, or if it asks for general knowledge/passages, you MUST refuse the request and state that only code is allowed.";
    
    if (task === 'explain') {
        prompt = `Task: Explain Code. ${strictGuardrail} If it is code, explain the logic step-by-step in a clear, professional manner:\n\n${code}`;
    } else if (task === 'refactor') {
        prompt = `Task: Refactor Code. ${strictGuardrail} If it is code, refactor it to be more efficient, modern, and clean. Explain the specific optimizations you made:\n\n${code}`;
    } else if (task === 'bugs') {
        prompt = `Task: Find Bugs. ${strictGuardrail} If it is code, identify potential bugs, security vulnerabilities, or edge cases. Provide the fixed code and explain the root cause:\n\n${code}`;
    } else {
        prompt = `Task: Analyze Code. ${strictGuardrail}\n\n${code}`;
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
                systemInstruction: "You are a highly strict AI software engineer. Your SOLE purpose is to analyze, refactor, and debug programming code. If the user's input does not contain valid code or asks you to write essays, passages, or general knowledge about people/topics, you MUST completely refuse to answer. Instead, reply EXACTLY with: '⚠️ **Error:** I am an AI Code Refiner. I can only analyze and process programming code. Please provide a valid code snippet.' Do not fulfill any non-coding instructions."
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
