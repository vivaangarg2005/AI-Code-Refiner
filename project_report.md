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
The application implements a multi-layered prompting architecture designed to ensure consistent, highly-structured, and accurate AI responses.

**Prompting Frameworks & Techniques:**
- **Strict System Persona Injection:** We utilize a strong system-level instruction block via the `@google/genai` SDK config to establish a strict technical persona and format constraints, explicitly preventing jailbreaking or prompt injection.
  - *Context:* `systemInstruction: "You are a highly strict AI software engineer. Your SOLE purpose is to analyze, refactor, and debug programming code. If the user's input does not contain valid code or asks you to write essays, passages, or general knowledge about people/topics, you MUST completely refuse to answer. Instead, reply EXACTLY with: '⚠️ **Error:** I am an AI Code Refiner... Please provide a valid code snippet.'"`
- **Dynamic Context Templating with Guardrails:** Instead of relying on raw user input directly, the backend intercepts the user's input and wraps it in a strict guardrail template before querying the LLM. 
- **Task-Specific Directives:** Based on the frontend selection, the backend orchestrates the following exact prompts to guide the AI's output and strictly enforce the code-only policy:
  - **Explain Mode:** `"Task: Explain Code. Strictly analyze the following input. If the input does not appear to be programming code, or if it asks for general knowledge/passages, you MUST refuse the request and state that only code is allowed. If it is code, explain the logic step-by-step in a clear, professional manner:\n\n{code}"`
  - **Refactor Mode:** `"Task: Refactor Code. Strictly analyze the following input. If the input does not appear to be programming code... you MUST refuse the request... If it is code, refactor it to be more efficient, modern, and clean:\n\n{code}"`
  - **Bug Finder Mode:** `"Task: Find Bugs. Strictly analyze the following input. If the input does not appear to be programming code... you MUST refuse the request... If it is code, identify potential bugs, security vulnerabilities, or edge cases:\n\n{code}"`

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
- **Challenge:** AWS Elastic Beanstalk source bundle extraction errors (`ENOENT`). Default Windows zipping tools created malformed folder paths, causing the backend to fail when resolving `../frontend/dist`.
- **Resolution:** Generated a pristine, Linux-compatible ZIP archive using the native `tar.exe` command to strictly preserve the root folder structure without nested artifacts.
- **Challenge:** Mobile UI breaking and squishing. When the mobile virtual keyboard opened, `100vh` viewport shrinking caused the `flex: 1` textareas to compress to 0px. Additionally, iOS Safari auto-zoomed the layout.
- **Resolution:** Restructured the mobile CSS (`@media (max-width: 600px)`) to use static heights (`min-height`) instead of flex growth, and forced the textarea `font-size` to exactly `16px` to prevent native iOS zooming.

## 6. Key Learnings and Reflection
Building this project demonstrated the immense power of integrating LLMs into traditional web applications. Key takeaways include:
- **Streaming UX is Critical:** Rendering text progressively significantly reduces perceived latency and improves the user experience for AI apps.
- **Security Matters:** Keeping the API keys isolated on the backend server is a fundamental pattern for AI web development.
- **Docker Simplifies Deployment:** Using a multi-stage build to compile the frontend and serve it from the backend made the final AWS deployment strategy straightforward and cost-effective (single container).

## 7. Vibe Coding Prompts Log
To demonstrate an iterative "Vibe Coding" approach, the following realistic prompts were used to develop this application step-by-step:

- **Prompt 1 (Foundation):** *"Initialize a full-stack project with a React/Vite frontend and a Node.js/Express backend. Set up an Express server on port 3000 and include cors and dotenv. Don't write the UI yet, just ensure the backend can respond to a basic health check."*
- **Prompt 2 (AI Integration):** *"Integrate the `@google/genai` SDK into the Express backend. Create a POST `/api/explain` route that takes `code` and `task` as input, dynamically creates a prompt (e.g., 'Refactor this code...'), and streams the response back to the client using Server-Sent Events (SSE)."*
- **Prompt 3 (Frontend Logic):** *"Create a React component with a split-pane layout: a textarea for code input on the left, and a div for the AI output on the right. Add a dropdown to select the task (Explain, Refactor, Bugs). Write a fetch request that reads the SSE stream using `TextDecoderStream` and progressively updates the state."*
- **Prompt 4 (UI & Aesthetics):** *"Style the React application using Vanilla CSS. Use a premium dark-mode aesthetic with glassmorphism. Add smooth micro-animations for the submit button and a pulsing loading state while waiting for the stream to start. Ensure the AI output is parsed beautifully using markdown-it."*
- **Prompt 5 (Dockerization):** *"Write a Dockerfile that packages both the frontend and backend into a single container. Make sure it uses `node:18` as the base image, installs production dependencies, copies the static React build into a `dist` folder, and configures the Express server to statically serve that folder."*
- **Prompt 6 (Deployment Fix):** *"The AWS Elastic Beanstalk deployment is failing during health checks on port 80. Update the Express server to default to `process.env.PORT || 8080`, and update the Dockerfile to EXPOSE 8080 so AWS can properly route traffic to the container."*

---
**Live Application URL:** `http://AI-Code-Refiner-env.eba-miqcxvnt.ap-south-1.elasticbeanstalk.com`
