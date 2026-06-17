import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import api from "../api/axios";

const QUICK_REPLIES = [
  "What does NayePankh do?",
  "How do I become a volunteer?",
  "How do I get a certificate?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Pankh 🕊️ — ask me anything about NayePankh Foundation!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (text) => {
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat/", { messages: newMessages.map(m => ({ role: m.role, content: m.content })) });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I'm having trouble connecting. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) send(input.trim());
  };

  return (
    <>
      {open && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <span>🕊️ Pankh — AI Assistant</span>
            <X size={20} style={{ cursor: "pointer" }} onClick={() => setOpen(false)} />
          </div>

          <div style={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...styles.bubble, ...(m.role === "user" ? styles.userBubble : styles.botBubble) }}>
                {m.content}
              </div>
            ))}
            {loading && <div style={{ ...styles.bubble, ...styles.botBubble }}>Typing...</div>}
            <div ref={scrollRef} />
          </div>

          {messages.length <= 1 && (
            <div style={styles.quickReplies}>
              {QUICK_REPLIES.map((q) => (
                <button key={q} style={styles.quickBtn} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.inputRow}>
            <input style={styles.input} placeholder="Type a message..."
              value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" style={styles.sendBtn}><Send size={18} /></button>
          </form>
        </div>
      )}

      <button style={styles.fab} onClick={() => setOpen(!open)}>
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </>
  );
}

const styles = {
  fab: {
    position: "fixed", bottom: "24px", right: "24px", width: "56px", height: "56px",
    borderRadius: "50%", background: "#1a6b3c", color: "#fff", border: "none",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 999,
  },
  chatWindow: {
    position: "fixed", bottom: "92px", right: "24px", width: "340px", height: "460px",
    background: "#fff", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 999,
  },
  header: {
    background: "#1a6b3c", color: "#fff", padding: "1rem", fontWeight: "700",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  messages: { flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" },
  bubble: { padding: "0.6rem 0.9rem", borderRadius: "12px", fontSize: "0.88rem", lineHeight: 1.5, maxWidth: "85%" },
  userBubble: { background: "#1a6b3c", color: "#fff", alignSelf: "flex-end" },
  botBubble: { background: "#f0f0f0", color: "#333", alignSelf: "flex-start" },
  quickReplies: { display: "flex", flexDirection: "column", gap: "0.4rem", padding: "0 1rem 0.6rem" },
  quickBtn: { background: "#e8f5ee", color: "#1a6b3c", border: "none", padding: "0.5rem 0.8rem", borderRadius: "8px", fontSize: "0.82rem", cursor: "pointer", textAlign: "left" },
  inputRow: { display: "flex", gap: "0.5rem", padding: "0.8rem", borderTop: "1px solid #eee" },
  input: { flex: 1, padding: "0.6rem 0.9rem", borderRadius: "20px", border: "1.5px solid #ddd", outline: "none", fontSize: "0.88rem" },
  sendBtn: { background: "#1a6b3c", color: "#fff", border: "none", width: "38px", height: "38px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
};