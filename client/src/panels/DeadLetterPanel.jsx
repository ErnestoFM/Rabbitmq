import { useState } from "react";
import MessageLog from "./MessageLog.jsx";

const PATTERN = "dead-letter";

export default function DeadLetterPanel({ messages, subscriptions, subscribe, unsubscribe, addMessage, clearMessages }) {
  const [text, setText] = useState("task-ok-1");
  const isSubscribed = subscriptions[PATTERN];

  const send = async () => {
    const res = await fetch("/api/dead-letter/send", {
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
      <h2>07 — Dead Letter Exchange (DLX)</h2>
      <p className="description">
        Messages that are rejected or expire are routed to a dead letter exchange.
        Messages containing &quot;fail&quot; will be rejected and sent to the DLX.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Message (include &quot;fail&quot; to trigger rejection)</label>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="task-ok or task-fail" />
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
