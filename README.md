# AI Code Refiner

This project is a full-stack AI-powered web application.

It features a beautiful glassmorphism React frontend, an Express Node.js backend, and streaming LLM integration using the Google Gemini API.

## Features
- **Modern UI:** Premium design aesthetic utilizing dark mode and glassmorphism.
- **Streaming Responses:** AI responses are streamed in real-time to the frontend.
- **Full-stack Containerized:** Packaged into a single multi-stage Docker container for easy AWS deployment.
- **Security:** API Keys are kept on the backend in the `.env` file and never exposed to the frontend.

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Docker (optional, for containerized testing)
- A Google Gemini API Key. (You can generate one at [Google AI Studio](https://aistudio.google.com/)).

### 1. Setup the Environment
In the `backend` directory, edit the `.env` file and replace the dummy key with your actual Gemini API Key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 2. Run without Docker
Open two terminals.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

### 3. Run with Docker
You can easily spin up the production build locally using Docker Compose. Ensure your `.env` key is set.

```bash
docker-compose up --build
```
Visit `http://localhost:3000` in your browser.

## AWS Deployment Guide (App Runner)
1. Push this entire repository to your GitHub.
2. Log into the AWS Console and go to **AWS App Runner**.
3. Create an App Runner service and connect it to your GitHub repository.
4. Set the build settings:
   - **Build Command:** `docker build -t ai-app .`
   - **Start Command:** `docker run -p 3000:3000 -e GEMINI_API_KEY=$GEMINI_API_KEY ai-app`
   *(Alternatively, configure App Runner to use the Dockerfile directly).*
5. Add your `GEMINI_API_KEY` to the App Runner Environment Variables.
6. Deploy and get your public HTTPS URL!
