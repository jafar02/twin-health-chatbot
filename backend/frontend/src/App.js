import { useState, useRef, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + speechResult : speechResult);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, { role: "bot", content: data.reply }]);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1>Twin Health Dashboard</h1>
      </header>

      <div style={styles.body}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <h2>Health Info</h2>
          <ul>
            <li>Metabolic Health Tips</li>
            <li>Twin Studies Data</li>
            <li>Nutrition Guides</li>
            <li>Exercise Recommendations</li>
            <li>FAQs</li>
          </ul>
        </aside>

        {/* Main Chat Area */}
        <main style={styles.main}>
          <div style={styles.chatBox}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === "user" ? styles.userMsg : styles.botMsg}>
                <b>{m.role === "user" ? "You" : "Twin Health"}:</b> {m.content}
              </div>
            ))}
            {loading && <div style={styles.loading}>Typing...</div>}
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputContainer}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Twin Health or use the mic..."
              style={styles.textarea}
            />
            <button onClick={sendMessage} style={styles.button} disabled={loading}>
              Send
            </button>
            <button
              onClick={startListening}
              style={{ ...styles.button, backgroundColor: listening ? "#16a34a" : "#1e3a8a" }}
            >
              {listening ? "Listening..." : "🎤"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f0f4f8",
  },
  header: {
    padding: 20,
    backgroundColor: "#1e3a8a",
    color: "#fff",
    textAlign: "center",
  },
  body: {
    display: "flex",
    flex: 1,
  },
  sidebar: {
    width: 220,
    backgroundColor: "#fff",
    borderRight: "1px solid #ccc",
    padding: 20,
  },
  main: {
    flex: 1,
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },
  chatBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    minHeight: 400,
    maxHeight: 600,
    overflowY: "auto",
    marginBottom: 10,
    border: "1px solid #ccc",
  },
  userMsg: {
    textAlign: "right",
    margin: "8px 0",
    padding: "6px 12px",
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    display: "inline-block",
    maxWidth: "80%",
  },
  botMsg: {
    textAlign: "left",
    margin: "8px 0",
    padding: "6px 12px",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    display: "inline-block",
    maxWidth: "80%",
  },
  loading: {
    fontStyle: "italic",
    color: "#6b7280",
    margin: "8px 0",
  },
  error: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
  inputContainer: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  textarea: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    resize: "none",
    fontSize: 14,
    height: 50,
  },
  button: {
    padding: "0 20px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#1e3a8a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    minWidth: 60,
    height: 50,
  },
};
