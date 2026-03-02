import { useState } from "react";
import MessageLog from "./MessageLog.jsx";

const PATTERN = "rpc";

export default function RpcPanel({ messages, addMessage, clearMessages }) {
  const [number, setNumber] = useState(10);
  const [loading, setLoading] = useState(false);

  const compute = async () => {
    setLoading(true);
    addMessage(PATTERN, {
      tag: "sent",
      content: `Requesting fibonacci(${number})...`,
      timestamp: new Date().toISOString(),
    });

    const res = await fetch("/api/rpc/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      addMessage(PATTERN, {
        tag: "result",
        content: `fibonacci(${data.input}) = ${data.result}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="pattern-panel">
      <h2>06 — RPC (Remote Procedure Call)</h2>
      <p className="description">
        Request/reply pattern. The server computes the Fibonacci number and returns the result.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Number (n)</label>
          <input
            type="number"
            min="0"
            max="50"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={compute} disabled={loading}>
          {loading ? "Computing..." : "Compute Fibonacci"}
        </button>
      </div>

      <MessageLog
        messages={messages[PATTERN] || []}
        pattern={PATTERN}
        onClear={clearMessages}
      />
    </div>
  );
}
