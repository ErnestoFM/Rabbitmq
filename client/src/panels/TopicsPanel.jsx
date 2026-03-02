import { useState } from "react";
import MessageLog from "./MessageLog.jsx";

const PATTERN = "topics";

export default function TopicsPanel({ messages, subscriptions, subscribe, unsubscribe, addMessage, clearMessages }) {
  const [routingKey, setRoutingKey] = useState("auth.info");
  const [text, setText] = useState("User signed in");
  const [topicPattern, setTopicPattern] = useState("#");
  const isSubscribed = subscriptions[PATTERN];

  const send = async () => {
    const res = await fetch("/api/topics/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routingKey, message: text }),
    });
    const data = await res.json();
    if (data.success) {
      addMessage(PATTERN, {
        tag: "sent",
        content: `[${routingKey}] ${text}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="pattern-panel">
      <h2>05 — Topics (Topic Exchange)</h2>
      <p className="description">
        A topic exchange routes messages using wildcard patterns.
        Use <code>*</code> to match exactly one word and <code>#</code> to match zero or more words.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Routing Key (e.g. auth.info, order.error)</label>
          <input value={routingKey} onChange={(e) => setRoutingKey(e.target.value)} placeholder="facility.severity" />
        </div>
        <div className="form-group">
          <label>Message</label>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter message..." />
        </div>
      </div>

      <div className="form-group">
        <label>Subscribe pattern (e.g. auth.*, *.error, #)</label>
        <input
          value={topicPattern}
          onChange={(e) => setTopicPattern(e.target.value)}
          disabled={isSubscribed}
          placeholder="Topic pattern..."
        />
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={send}>Send</button>
        {isSubscribed ? (
          <button className="btn btn-danger" onClick={() => unsubscribe(PATTERN)}>Stop Consumer</button>
        ) : (
          <button
            className="btn btn-success"
            onClick={() => subscribe(PATTERN, { patterns: topicPattern.split(",").map((p) => p.trim()) })}
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
