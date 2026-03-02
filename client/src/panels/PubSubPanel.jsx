import { useState } from "react";
import MessageLog from "./MessageLog.jsx";

const PATTERN = "pub-sub";

export default function PubSubPanel({ messages, subscriptions, subscribe, unsubscribe, addMessage, clearMessages }) {
  const [text, setText] = useState("INFO: Application started");
  const isSubscribed = subscriptions[PATTERN];

  const publish = async () => {
    const res = await fetch("/api/pub-sub/publish", {
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
      <h2>03 — Publish/Subscribe (Fanout Exchange)</h2>
      <p className="description">
        A fanout exchange broadcasts every message to all bound queues.
        Each subscriber receives a copy of every message.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Log Message</label>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter log message..." />
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={publish}>Publish</button>
        {isSubscribed ? (
          <button className="btn btn-danger" onClick={() => unsubscribe(PATTERN)}>Stop Subscriber</button>
        ) : (
          <button className="btn btn-success" onClick={() => subscribe(PATTERN)}>Start Subscriber</button>
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
