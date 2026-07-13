# Project Report: AI Code Refiner

## 1. Application Overview and Tech Stack
The **AI Code Refiner** is a full-stack, AI-powered web application designed to help developers understand, refactor, and debug their code. It utilizes a modern split-pane UI where users input code on one side and receive real-time, streaming AI analysis on the other.

**Tech Stack:**
- **Frontend:** React.js (via Vite) with Vanilla CSS (Glassmorphism styling)
- **Backend:** Node.js with Express
- **AI Integration:** Google Gemini (Gemini-2.5-flash) via `@google/genai`
- **Containerization:** Docker (Multi-stage build)
- **Deployment Target:** AWS (App Runner / Elastic Beanstalk)

## 2. Prompting Strategy and Frameworks Used
The application uses **system instructions** to set the persona and **dynamic prompt injection** based on the user's selected task. 

**Framework Used:** 
- *Persona & Context Setting:* The AI is instructed via the SDK config: `systemInstruction: "You are an expert AI software engineer. Provide your responses in Markdown format. Be direct and helpful."`
- *Dynamic User Prompts:* Based on the frontend dropdown, the prompt changes dynamically:
  - **Explain:** `"Explain the following code snippet in a very clear, concise, and professional manner:\n\n{code}"`
  - **Refactor:** `"Refactor the following code snippet to be more efficient and clean, and explain what you changed:\n\n{code}"`
  - **Bugs:** `"Find and explain any potential bugs or vulnerabilities in this code:\n\n{code}"`

## 3. Phase-by-Phase Development Summary
- **Phase 1: Planning & Architecture:** Decided on a unified full-stack architecture to simplify Docker deployment. Selected Vite/React for the frontend and Express for the backend.
- **Phase 2: Backend & AI Integration:** Built the Express server. Integrated `@google/genai` to handle the LLM connection and implemented Server-Sent Events (SSE) to stream the response chunks back to the client.
- **Phase 3: Frontend & UI Design:** Developed the React application. Created a premium dark-mode glassmorphism design using Vanilla CSS. Implemented the `fetch` API and `TextDecoderStream` to parse the incoming SSE stream and render it progressively using `markdown-it`.
- **Phase 4: Containerization:** Wrote a multi-stage Dockerfile that builds the React static files and serves them statically through the Express server, ensuring a single container deployment.

## 4. Application Architecture
The architecture follows a unified client-server model packaged inside a single Docker container:
1. **Client (React):** Handles the UI and streams data via a POST request to `/api/explain`.
2. **Server (Express):** Receives the request, acts as a secure proxy, and holds the `GEMINI_API_KEY` in environment variables so it is never exposed to the client.
3. **AI Provider (Gemini API):** Processes the prompt and streams chunks back to the Express server, which pipes them directly to the React client.
4. **Static Serving:** In production (Docker), Express statically serves the compiled Vite assets from the `dist` folder on the same port (3000).

## 5. Challenges Encountered and How They Were Resolved
- **Challenge:** Handling streaming POST requests in the frontend. Native `EventSource` in the browser only supports GET requests, making it difficult to send the code payload securely.
- **Resolution:** Used the modern `fetch` API alongside a `ReadableStream` reader (`response.body.getReader()`) and a `TextDecoder` to manually parse the Server-Sent Events stream chunk-by-chunk.
- **Challenge:** Express v5 `path-to-regexp` routing errors for wildcard SPA fallbacks (`app.get('*')`).
- **Resolution:** Replaced the wildcard route with a generic middleware catch-all (`app.use(...)`) to safely serve the React `index.html` without triggering path syntax errors.

## 6. Key Learnings and Reflection
Building this project demonstrated the immense power of integrating LLMs into traditional web applications. Key takeaways include:
- **Streaming UX is Critical:** Rendering text progressively significantly reduces perceived latency and improves the user experience for AI apps.
- **Security Matters:** Keeping the API keys isolated on the backend server is a fundamental pattern for AI web development.
- **Docker Simplifies Deployment:** Using a multi-stage build to compile the frontend and serve it from the backend made the final AWS deployment strategy straightforward and cost-effective (single container).

---
**Live Application URL:** `[INSERT AWS URL HERE]`
