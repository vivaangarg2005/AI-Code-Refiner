# AI Code Refiner

A full-stack AI-powered web application that analyzes, explains, and refactors code in real-time using Google Gemini API. Features a modern React frontend with glassmorphism design and Express backend with streaming LLM integration.

**Live Demo:** [http://AI-Code-Refiner-env.eba-miqcxvnt.ap-south-1.elasticbeanstalk.com](http://AI-Code-Refiner-env.eba-miqcxvnt.ap-south-1.elasticbeanstalk.com)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [License](#license)

## Features

- **Modern UI:** Premium glassmorphism design with dark mode and responsive layout
- **Real-time Streaming:** AI responses stream character-by-character for immediate feedback
- **Multi-task Capabilities:** Explain Code, Refactor & Optimize, and Find Bugs modes
- **Full-stack Containerized:** Docker-based for seamless AWS deployment
- **Security:** API keys managed securely on backend via `.env` file
- **Markdown Rendering:** Clean formatting with syntax highlighting for code blocks
- **Cross-language Support:** Works with C++, Python, JavaScript, and more

## Tech Stack

### Frontend

- React 19.2
- Vite 8.1
- markdown-it for code rendering
- CSS with glassmorphism effects

### Backend

- Node.js with Express 5.2
- Google Gemini API (@google/genai)
- Server-Sent Events (SSE) for streaming
- CORS enabled

### DevOps

- Docker (multi-stage build)
- AWS Elastic Beanstalk
- Environment-based configuration

## Project Structure

```
.
├── frontend/                  # React Vite application
│   ├── src/
│   │   ├── App.jsx           # Main app component
│   │   ├── App.css           # Styling with glassmorphism
│   │   ├── main.jsx          # Entry point
│   │   └── assets/           # Static assets
│   ├── public/               # Public assets
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/                   # Express Node.js server
│   ├── server.js             # Main server file
│   ├── package.json
│   └── .env                  # Environment variables (not in repo)
├── Dockerfile               # Multi-stage Docker build
├── README.md               # This file
├── concept_note.md         # Project concept and requirements
└── project_report.md       # Project report
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Docker (optional, for containerized testing)
- Google Gemini API Key ([generate here](https://aistudio.google.com/))

### Local Development

#### 1. Setup Environment

Create `.env` file in the `backend` directory:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

#### 2. Install and Run

**Option A: Separate Terminals**

Terminal 1 (Backend):

```bash
cd backend
npm install
node server.js
```

Terminal 2 (Frontend):

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

**Option B: With Docker**

```bash
docker build -t ai-code-refiner .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_actual_api_key_here ai-code-refiner
```

Visit `http://localhost:8080`

### Available Scripts

**Backend:**

```bash
node server.js          # Start development server
```

**Frontend:**

```bash
npm run dev            # Start Vite dev server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run oxlint
```

## Deployment

This application is fully containerized and currently deployed on **AWS Elastic Beanstalk**.

### AWS Deployment Guide (Elastic Beanstalk)

1. Create a ZIP file with production assets:

   ```bash
   tar.exe -a -c -f project.zip Dockerfile .dockerignore backend/server.js backend/package.json frontend/dist
   ```

2. Log into AWS Console and navigate to **Elastic Beanstalk**

3. Create a new environment with these settings:
   - Platform: **Docker** (Amazon Linux 2023)
   - Upload the `project.zip` file

4. Configure environment:
   - Go to **Configuration > Updates, monitoring, and routing**
   - Add `GEMINI_API_KEY` as an Environment Property

5. Set IAM permissions:
   - Attach to EC2 Instance Profile IAM Role:
     - `AWSElasticBeanstalkWebTier`
     - `AWSElasticBeanstalkWorkerTier`
     - `AWSElasticBeanstalkMulticontainerDocker`

6. Deploy and access your live application!

## How It Works

1. **Frontend:** User pastes code and selects a task (Explain/Refactor/Debug)
2. **Backend:** Express server receives request and calls Google Gemini API
3. **Streaming:** Response streams via Server-Sent Events (SSE) to frontend
4. **Display:** React app renders markdown with syntax highlighting in real-time

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000  # Optional, defaults to 3000
```

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## License

This project is provided as-is for educational purposes.

---

**Questions?** Check [concept_note.md](concept_note.md) for detailed project documentation.
