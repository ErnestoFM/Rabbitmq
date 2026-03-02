import { useState } from "react";
import MessageLog from "./MessageLog.jsx";

const PATTERN = "basic";

export default function BasicPanel({ messages, subscriptions, subscribe, unsubscribe, addMessage, clearMessages }) {
  const [text, setText] = useState("Hello RabbitMQ!");
  const isSubscribed = subscriptions[PATTERN];

  const send = async () => {
    const res = await fetch("/api/basic/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    if (data.success) {
      addMessage(PATTERN, { tag: "sent", content: text, timestamp: new Date().toISOString() });
    }
  };

  return (
    <div className="pattern-panel">
      <h2>01 — Basic (Point-to-Point)</h2>
      <p className="description">
        The simplest pattern: one producer sends a message to a named queue, one consumer reads it.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Message</label>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter message..." />
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={send}>Send Message</button>
        {isSubscribed ? (
          <button className="btn btn-danger" onClick={() => unsubscribe(PATTERN)}>Stop Consumer</button>
        ) : (
          <button className="btn btn-success" onClick={() => subscribe(PATTERN)}>Start Consumer</button>
        )}
      </div>

      <MessageLog
        messages={messages[PATTERN] || []}
        pattern={PATTERN}
        onClear={clearMessages}
      />
    </div>
  );
}
