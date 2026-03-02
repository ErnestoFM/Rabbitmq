import { useState } from "react";
import MessageLog from "./MessageLog.jsx";

const PATTERN = "routing";

export default function RoutingPanel({ messages, subscriptions, subscribe, unsubscribe, addMessage, clearMessages }) {
  const [severity, setSeverity] = useState("info");
  const [text, setText] = useState("User logged in");
  const [selectedSeverities, setSelectedSeverities] = useState(["info", "warning", "error"]);
  const isSubscribed = subscriptions[PATTERN];

  const send = async () => {
    const res = await fetch("/api/routing/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ severity, message: text }),
    });
    const data = await res.json();
    if (data.success) {
      addMessage(PATTERN, {
        tag: "sent",
        content: `[${severity}] ${text}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const toggleSeverity = (sev) => {
    setSelectedSeverities((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
    );
  };

  return (
    <div className="pattern-panel">
      <h2>04 — Routing (Direct Exchange)</h2>
      <p className="description">
        A direct exchange routes messages to queues whose binding key matches the routing key exactly.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="error">error</option>
          </select>
        </div>
        <div className="form-group">
          <label>Message</label>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter message..." />
        </div>
      </div>

      <div className="form-group">
        <label>Subscribe to severities:</label>
        <div className="checkbox-group">
          {["info", "warning", "error"].map((sev) => (
            <label key={sev}>
              <input
                type="checkbox"
                checked={selectedSeverities.includes(sev)}
                onChange={() => toggleSeverity(sev)}
                disabled={isSubscribed}
              />
              {sev}
            </label>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={send}>Send</button>
        {isSubscribed ? (
          <button className="btn btn-danger" onClick={() => unsubscribe(PATTERN)}>Stop Consumer</button>
        ) : (
          <button
            className="btn btn-success"
            onClick={() => subscribe(PATTERN, { severities: selectedSeverities })}
            disabled={selectedSeverities.length === 0}
          >
            Start Consumer
          </button>
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
