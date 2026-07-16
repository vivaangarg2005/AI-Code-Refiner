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
You can easily spin up the production build locally using Docker.

```bash
docker build -t ai-code-refiner .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_actual_api_key_here ai-code-refiner
```
Visit `http://localhost:8080` in your browser.

## Deployment
This application is fully containerized and currently deployed on **AWS Elastic Beanstalk**.
**Live URL:** [http://AI-Code-Refiner-env.eba-miqcxvnt.ap-south-1.elasticbeanstalk.com](http://AI-Code-Refiner-env.eba-miqcxvnt.ap-south-1.elasticbeanstalk.com)

## AWS Deployment Guide (Elastic Beanstalk)
1. Run `tar.exe -a -c -f project.zip Dockerfile .dockerignore backend/server.js backend/package.json frontend/dist` from the root directory to create a pristine ZIP file.
2. Log into the AWS Console and go to **AWS Elastic Beanstalk**.
3. Create a new environment using the **Docker** platform (Amazon Linux 2023).
4. Upload the `project.zip` file as your application code.
5. In the **Configuration > Updates, monitoring, and routing** section, add your `GEMINI_API_KEY` as an Environment Property.
6. Make sure the IAM Role attached to the EC2 Instance Profile has the `AWSElasticBeanstalkWebTier`, `AWSElasticBeanstalkWorkerTier`, and `AWSElasticBeanstalkMulticontainerDocker` policies.
7. Deploy the environment and access the live application!
