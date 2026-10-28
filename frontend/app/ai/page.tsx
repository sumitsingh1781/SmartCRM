
"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  time: string;
};

const prompts = [
  {
    icon: "✦",
    title: "Summarize my CRM",
    description: "Understand your customers and sales activity.",
    prompt: "Give me an overview of my CRM customers, leads, deals and tasks.",
  },
  {
    icon: "↗",
    title: "Analyze sales pipeline",
    description: "Discover opportunities and sales bottlenecks.",
    prompt: "Analyze my sales pipeline and suggest the next steps.",
  },
  {
    icon: "◎",
    title: "Improve lead conversion",
    description: "Find ways to convert more leads.",
    prompt: "How can I improve my lead conversion rate?",
  },
  {
    icon: "✓",
    title: "Plan my day",
    description: "Prioritize your follow-ups and tasks.",
    prompt: "Help me prioritize my pending CRM tasks for today.",
  },
];

const welcome: Message = {
  id: 1,
  role: "assistant",
  text: "Hi Sumit! 👋 Welcome to SmartCRM AI. I can help you analyze sales, understand your leads, prepare follow-ups and plan your next steps. What would you like to work on?",
  time: "Now",
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(value?: string) {
    const question = (value ?? input).trim();

    if (!question || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: question,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://smartcrm-backend-cm0u.onrender.com/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          prompt: question,
          history: [...messages, userMessage].map((message) => ({
            role: message.role,
            content: message.text,
          })),
        }),
      });

      const raw = await response.text();
      let data: Record<string, unknown>;

      try {
        data = JSON.parse(raw);
      } catch {
        data = { reply: raw };
      }

      if (!response.ok) {
        throw new Error(
          String(data.error || data.message || `Request failed: ${response.status}`)
        );
      }

      const answer =
        data.reply ??
        data.response ??
        data.answer ??
        data.message ??
        data.text;

      if (typeof answer !== "string") {
        throw new Error(
          "AI response format does not match. Check your backend response."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: answer,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the AI service."
      );
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([
      {
        ...welcome,
        id: Date.now(),
      },
    ]);
    setInput("");
    setError("");
  }

  return (
    <main className="ai-page">
      <style jsx>{`
        .ai-page {
          min-height: calc(100vh - 60px);
          padding: 28px;
          color: #e8f1ff;
          background:
            radial-gradient(ellipse at 50% 0%, #102a4b 0%, transparent 55%),
            #071321;
        }

        .ai-container {
          max-width: 1450px;
          margin: auto;
        }

        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 25px;
        }

        .eyebrow {
          color: #6cb7ff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .heading {
          margin: 10px 0;
          font-size: clamp(27px, 3vw, 37px);
          font-weight: 800;
          letter-spacing: -1.5px;
        }

        .heading span {
          color: #6c7cff;
        }

        .subtitle {
          color: #8fa9c7;
          font-size: 13px;
          line-height: 1.7;
        }

        .button {
          padding: 11px 16px;
          border: 1px solid #244361;
          border-radius: 10px;
          color: #dceaff;
          background: #0d2034;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .button.primary {
          border: 0;
          background: linear-gradient(100deg, #168bff, #7545ff);
          color: white;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 285px;
          gap: 18px;
        }

        .panel {
          overflow: hidden;
          border: 1px solid #1c3652;
          border-radius: 17px;
          background: #0a1929;
        }

        .chat {
          display: flex;
          min-height: 660px;
          height: calc(100vh - 250px);
          flex-direction: column;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 17px 20px;
          border-bottom: 1px solid #1c3652;
          background: #0d1e30;
        }

        .assistant-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          display: grid;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(140deg, #168bff, #7545ff);
          font-size: 20px;
        }

        .chat-title {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 800;
        }

        .online {
          color: #8fa9c7;
          font-size: 11px;
        }

        .online span {
          color: #23d6a0;
        }

        .model {
          padding: 8px 10px;
          border: 1px solid #254563;
          border-radius: 8px;
          color: #8cc6ff;
          background: #102943;
          font-size: 10px;
          white-space: nowrap;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 25px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 25px;
          color: #6985a3;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .divider:before,
        .divider:after {
          height: 1px;
          flex: 1;
          background: #1b3047;
          content: "";
        }

        .message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 22px;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          display: grid;
          width: 31px;
          height: 31px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #254563;
          border-radius: 10px;
          color: #91caff;
          background: #122b45;
          font-size: 12px;
          font-weight: 800;
        }

        .message.user .message-avatar {
          border: 0;
          color: white;
          background: linear-gradient(135deg, #168bff, #7545ff);
        }

        .message-body {
          max-width: 82%;
          min-width: 0;
        }

        .meta {
          display: flex;
          gap: 9px;
          margin-bottom: 7px;
          color: #8fa9c7;
          font-size: 10px;
        }

        .message.user .meta {
          justify-content: flex-end;
        }

        .bubble {
          padding: 13px 15px;
          border: 1px solid #1c3652;
          border-radius: 4px 14px 14px 14px;
          color: #dce9f9;
          background: #0e2034;
          font-size: 12px;
          line-height: 1.8;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .message.user .bubble {
          border-color: #355db0;
          border-radius: 14px 4px 14px 14px;
          color: white;
          background: linear-gradient(135deg, #124c8b, #40328e);
        }

        .composer-area {
          padding: 15px 18px;
          border-top: 1px solid #1c3652;
          background: #091727;
        }

        .composer {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          padding: 10px 10px 10px 15px;
          border: 1px solid #254563;
          border-radius: 14px;
          background: #0d2034;
        }

        .composer:focus-within {
          border-color: #3984d1;
        }

        .composer textarea {
          min-height: 43px;
          max-height: 130px;
          flex: 1;
          resize: vertical;
          border: 0;
          outline: none;
          color: #e8f1ff;
          background: transparent;
          font: inherit;
          font-size: 12px;
          line-height: 1.7;
        }

        .composer textarea::placeholder {
          color: #6985a3;
        }

        .send {
          display: grid;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          place-items: center;
          border: 0;
          border-radius: 10px;
          color: white;
          background: linear-gradient(135deg, #168bff, #7545ff);
          font-size: 21px;
          cursor: pointer;
        }

        .send:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .hint {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
          color: #6985a3;
          font-size: 10px;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .side-card {
          padding: 17px;
          border: 1px solid #1c3652;
          border-radius: 15px;
          background: linear-gradient(150deg, #0d1f33, #091625);
        }

        .side-card h3 {
          margin: 0;
          font-size: 12px;
        }

        .side-description {
          margin: 9px 0 14px;
          color: #829db9;
          font-size: 11px;
          line-height: 1.7;
        }

        .suggestion {
          display: flex;
          width: 100%;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 8px;
          border: 1px solid transparent;
          border-radius: 10px;
          color: #dceaff;
          text-align: left;
          background: transparent;
          cursor: pointer;
        }

        .suggestion:hover {
          border-color: #244766;
          background: #102943;
        }

        .suggestion-icon {
          display: grid;
          width: 31px;
          height: 31px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 9px;
          color: #83c7ff;
          background: #12355a;
        }

        .suggestion strong {
          display: block;
          margin-bottom: 5px;
          font-size: 11px;
        }

        .suggestion small {
          display: block;
          color: #819bb8;
          font-size: 10px;
          line-height: 1.5;
        }

        .tip {
          margin-top: 12px;
          color: #91a9c4;
          font-size: 11px;
          line-height: 1.8;
        }

        .error {
          margin: 0 18px 12px;
          padding: 11px;
          border: 1px solid #743044;
          border-radius: 9px;
          color: #ffbdc9;
          background: #351923;
          font-size: 11px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .typing {
          color: #8ec8ff;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          50% { opacity: 0.4; }
        }

        @media (max-width: 1050px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .chat {
            height: 680px;
          }
        }

        @media (max-width: 650px) {
          .ai-page {
            padding: 18px 12px;
          }

          .ai-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .sidebar {
            grid-template-columns: 1fr;
          }

          .chat {
            height: 70vh;
            min-height: 520px;
          }

          .messages {
            padding: 15px;
          }

          .message-body {
            max-width: 88%;
          }

          .model {
            display: none;
          }

          .hint {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="ai-container">
        <header className="ai-header">
          <div>
            <div className="eyebrow">✦ SMARTCRM INTELLIGENCE</div>
            <h1 className="heading">
              AI <span>Assistant</span>
            </h1>
            <p className="subtitle">
              Your intelligent sales companion. Uncover insights and move deals
              forward.
            </p>
          </div>

          <button className="button primary" onClick={newChat}>
            + New chat
          </button>
        </header>

        <div className="layout">
          <section className="panel chat">
            <div className="chat-header">
              <div className="assistant-info">
                <div className="avatar">✦</div>
                <div>
                  <h2 className="chat-title">SmartCRM AI</h2>
                  <div className="online">
                    <span>●</span> Your sales assistant
                  </div>
                </div>
              </div>
              <span className="model">✧ AI SALES COPILOT</span>
            </div>

            <div className="messages">
              <div className="divider">CONVERSATION</div>

              {messages.map((message) => (
                <div className={`message ${message.role}`} key={message.id}>
                  <div className="message-avatar">
                    {message.role === "assistant" ? "✦" : "S"}
                  </div>

                  <div className="message-body">
                    <div className="meta">
                      <strong>
                        {message.role === "assistant"
                          ? "SmartCRM AI"
                          : "You"}
                      </strong>
                      <span>{message.time}</span>
                    </div>

                    <div className="bubble">{message.text}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message">
                  <div className="message-avatar">✦</div>
                  <div className="message-body">
                    <div className="meta">SmartCRM AI · Thinking</div>
                    <div className="bubble typing">
                      Thinking about your question...
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {error && <div className="error">⚠ {error}</div>}

            <div className="composer-area">
              <form
                className="composer"
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage();
                }}
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Ask about customers, leads, deals..."
                  aria-label="Message SmartCRM AI"
                />

                <button
                  className="send"
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                >
                  ↑
                </button>
              </form>

              <div className="hint">
                <span>Enter to send · Shift + Enter for a new line</span>
                <span>Verify important AI-generated details.</span>
              </div>
            </div>
          </section>

          <aside className="sidebar">
            <section className="side-card">
              <h3>✦ &nbsp; Quick prompts</h3>
              <p className="side-description">
                Choose a prompt to get started faster.
              </p>

              {prompts.map((item) => (
                <button
                  className="suggestion"
                  key={item.title}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendMessage(item.prompt)}
                >
                  <span className="suggestion-icon">{item.icon}</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              ))}
            </section>

            <section className="side-card">
              <h3>⌁ &nbsp; Tips for better answers</h3>
              <p className="side-description">
                Get more value from your AI assistant.
              </p>
              <div className="tip">
                ✦ Be specific about your sales goal.
              </div>
              <div className="tip">
                ↗ Ask for clear next steps and follow-up messages.
              </div>
              <div className="tip">
                ◈ Verify important numbers against your CRM records.
              </div>
            </section>

            <section className="side-card">
              <h3>◉ &nbsp; Workspace context</h3>
              <p className="side-description">
                Ask questions about your sales workflow. Available CRM data
                depends on your backend AI integration.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
