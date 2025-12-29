import { useState, useEffect, useRef } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;

      recognition.onresult = (event) => {
        setInput(event.results[0][0].transcript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Server error. Try again later." },
      ]);
    }
  };

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <header style={styles.header}>Twin Health AI</header>

      {/* DASHBOARD */}
      <div style={styles.dashboard}>
        <div style={styles.card}>💬 Chat</div>
        <div style={styles.card}>🥗 Nutrition</div>
        <div style={styles.card}>💪 Fitness</div>
        <div style={styles.card}>📊 Reports</div>
      </div>

      {/* CHAT AREA */}
      <div style={styles.main}>
        <div style={styles.chatBox}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={msg.role === "user" ? styles.userMsg : styles.botMsg}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="Type or speak..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            style={styles.micBtn}
            onClick={() => recognitionRef.current?.start()}
          >
            🎤
          </button>

          <button style={styles.sendBtn} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  app: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Segoe UI, sans-serif",
    background: "#f3f4f6",
  },

  header: {
    padding: "14px",
    background: "#1e3a8a",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "600",
  },

  dashboard: {
    display: "flex",
    gap: "12px",
    padding: "10px",
    background: "#ffffff",
    borderBottom: "1px solid #ddd",
  },

  card: {
    padding: "10px 16px",
    background: "#eef2ff",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "12px",
  },

  chatBox: {
    flex: 1,
    background: "#ffffff",
    borderRadius: "10px",
    padding: "12px",
    overflowY: "auto",
    border: "1px solid #ddd",
  },

  userMsg: {
    alignSelf: "flex-end",
    background: "#dbeafe",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "6px",
    maxWidth: "75%",
  },

  botMsg: {
    alignSelf: "flex-start",
    background: "#f1f5f9",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "6px",
    maxWidth: "75%",
  },

  inputRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  sendBtn: {
    padding: "10px 18px",
    background: "#1e3a8a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  micBtn: {
    padding: "10px 14px",
    background: "#22c55e",
    color: "#fff",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
  },
};
