import { useState, useRef, useEffect } from 'react';
import markdownit from 'markdown-it';
import './index.css';

const md = markdownit({ html: true, breaks: true, linkify: true });

function App() {
  const [code, setCode] = useState('');
  const [task, setTask] = useState('explain');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // Default 50%
  const outputRef = useRef(null);
  const isDragging = useRef(false);

  // Drag-to-resize logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      // Calculate percentage based on window width
      const newWidth = (e.clientX / window.innerWidth) * 100;
      // Constrain between 20% and 80%
      if (newWidth >= 20 && newWidth <= 80) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDrag = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
  };

  // Auto-scroll to bottom as output streams
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleGenerate = async () => {
    if (!code.trim()) return;
    
    setIsGenerating(true);
    setOutput('');

    try {
      // We use fetch to handle POST request and read the readable stream
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, task }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let streamedText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          
          // The server sends standard SSE formatted lines: "data: {...}\n\n"
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  streamedText += parsed.text;
                  setOutput(streamedText);
                } else if (parsed.error) {
                  streamedText += `\n\n**Error:** ${parsed.error}`;
                  setOutput(streamedText);
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setOutput((prev) => prev + '\n\n**Error:** Failed to connect to the server.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">AI Code Refiner</h1>
        <p className="app-subtitle">Understand, refactor, and debug your code instantly</p>
      </header>
      
      <main className="split-pane" style={{ '--left-width': `${leftWidth}%` }}>
        {/* Input Panel */}
        <section className="panel input-panel">
          <div className="panel-header">
            <span>Input Code</span>
          </div>
          <div className="input-group">
            <label htmlFor="task-select">What should the AI do?</label>
            <select 
              id="task-select" 
              value={task} 
              onChange={(e) => setTask(e.target.value)}
              disabled={isGenerating}
            >
              <option value="explain">Explain Code</option>
              <option value="refactor">Refactor & Optimize</option>
              <option value="bugs">Find Bugs</option>
            </select>
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="code-input">Paste your code below:</label>
            <textarea 
              id="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your JavaScript, Python, C++, or any code here..."
              disabled={isGenerating}
            />
          </div>
          <button 
            className="btn-primary" 
            onClick={handleGenerate}
            disabled={isGenerating || !code.trim()}
          >
            {isGenerating ? (
              <><span className="spinner"></span> Processing...</>
            ) : (
              'Generate Analysis'
            )}
          </button>
        </section>

        {/* Resizable Divider */}
        <div 
          className="resizer" 
          onMouseDown={startDrag}
          title="Drag to resize"
        >
          <span className="resizer-icon">↔</span>
        </div>

        {/* Output Panel */}
        <section className="panel output-panel">
          <div className="panel-header">
            <span>AI Analysis</span>
            {isGenerating && <span style={{fontSize: '0.8rem', color: 'var(--primary-color)'}}>Streaming...</span>}
          </div>
          
          <div className="output-content" ref={outputRef}>
            {output ? (
              <div dangerouslySetInnerHTML={{ __html: md.render(output) }} />
            ) : (
              <div className="placeholder-text">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '1rem'}}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <p>The AI's response will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
