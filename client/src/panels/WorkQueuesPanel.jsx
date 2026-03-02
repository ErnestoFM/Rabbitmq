import { useState } from "react";
import MessageLog from "./MessageLog.jsx";

const PATTERN = "work-queues";

export default function WorkQueuesPanel({ messages, subscriptions, subscribe, unsubscribe, addMessage, clearMessages }) {
  const [task, setTask] = useState("task.medium..");
  const isSubscribed = subscriptions[PATTERN];

  const send = async () => {
    const res = await fetch("/api/work-queues/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });
    const data = await res.json();
    if (data.success) {
      addMessage(PATTERN, { tag: "sent", content: task, timestamp: new Date().toISOString() });
    }
  };

  return (
    <div className="pattern-panel">
      <h2>02 — Work Queues (Competing Consumers)</h2>
      <p className="description">
        Multiple workers share a task queue. Each dot in the task represents 1 second of processing time.
        Uses prefetch(1) for fair dispatch.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Task (dots = processing seconds)</label>
          <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="task.name..." />
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={send}>Send Task</button>
        {isSubscribed ? (
          <button className="btn btn-danger" onClick={() => unsubscribe(PATTERN)}>Stop Worker</button>
        ) : (
          <button className="btn btn-success" onClick={() => subscribe(PATTERN)}>Start Worker</button>
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
