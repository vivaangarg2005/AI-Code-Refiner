# AI Code Refiner — Frontend Client

A responsive, high-performance web interface built with **React 19** and **Vite**, featuring a modern glassmorphic aesthetic, dark/light theme toggle, resizable split-pane editor, and real-time Server-Sent Events (SSE) streaming for AI-generated code analysis.

---

## 🚀 Features

- **Real-Time Streaming Reader**: Consumes streaming chunks over HTTP from the Express backend via Server-Sent Events (SSE) and decodes them on the fly.
- **Interactive Resizable Split-Pane**: Custom drag-to-resize divider allowing users to fluidly adjust editor width from 20% to 80%.
- **Dual-Theme Support**: Dark and Light modes with automated detection of system `prefers-color-scheme` and local storage persistence.
- **Markdown & Code Rendering**: Live rendering of markdown explanations and formatted code blocks powered by [`markdown-it`](https://github.com/markdown-it/markdown-it).
- **Auto-Scrolling**: Automatically tracks and scrolls the output panel as tokens stream in.
- **Fast Tooling**: Bundled with Vite 8 and linted with [Oxlint](https://oxc.rs) for near-instant build and linting cycles.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **[React 19](https://react.dev/)** | Modern component framework and reactive state management |
| **[Vite 8](https://vitejs.dev/)** | Next-generation frontend tooling and rapid HMR development server |
| **[markdown-it](https://github.com/markdown-it/markdown-it)** | Fast markdown parsing and rendering |
| **[Oxlint](https://oxc.rs/)** | Ultra-fast linter for JavaScript / React |
| **CSS3** | Glassmorphism, CSS variables, and responsive layout styling |

---

## 📁 Directory Structure

```
frontend/
├── dist/                  # Production build output (served by Express or Docker)
├── public/                # Static public assets
├── src/
│   ├── assets/            # Component media and icons
│   ├── App.jsx            # Main application component (state, SSE consumer, split-pane)
│   ├── App.css            # Component-specific styles
│   ├── index.css          # Design system tokens, themes, and global glassmorphism CSS
│   └── main.jsx           # React DOM root entry point
├── .oxlintrc.json         # Oxlint configuration
├── index.html             # HTML template
├── package.json           # Frontend dependencies & scripts
└── vite.config.js         # Vite configuration with backend proxy
```

---

## ⚙️ Development Setup

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The app will launch at: `http://localhost:5173`

> [!NOTE]
> In development mode, API requests to `/api/*` are automatically proxied to the backend at `http://localhost:8080` via `vite.config.js`. Ensure your backend server is running on port 8080.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Dev** | `npm run dev` | Runs the Vite development server with Hot Module Replacement (HMR) |
| **Build** | `npm run build` | Compiles and bundles production-ready assets into `dist/` |
| **Preview** | `npm run preview` | Locally previews the production build from `dist/` |
| **Lint** | `npm run lint` | Runs the Oxlint linter to detect code smells and syntax issues |

---

## 🔌 API Integration Details

The frontend initiates a `POST` request to `/api/explain` with JSON payload:

```json
{
  "code": "function add(a, b) { return a + b; }",
  "task": "explain" // Options: "explain" | "refactor" | "bugs"
}
```

The response is parsed as a chunked stream (`TextDecoder` + `ReadableStreamDefaultReader`):
- `data: {"text": "..."}`: Appended in real-time to the markdown output.
- `data: [DONE]`: Closes the reader and re-enables the UI controls.
- `data: {"error": "..."}`: Displays formatted error notice if API generation fails.
