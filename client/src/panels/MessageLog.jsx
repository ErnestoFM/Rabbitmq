export default function MessageLog({ messages = [], pattern, onClear }) {
  return (
    <div className="messages-section">
      <h3>
        Messages
        <span className="badge">
          {messages.length}
          {messages.length > 0 && (
            <span
              style={{ marginLeft: "0.5rem", cursor: "pointer" }}
              onClick={() => onClear(pattern)}
              title="Clear messages"
            >
              ✕
            </span>
          )}
        </span>
      </h3>
      <div className="messages-log">
        {messages.length === 0 ? (
          <div className="empty-state">No messages yet. Send or subscribe to see them here.</div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="message-item">
              <span className="time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              {msg.tag && (
                <span className={`tag tag-${msg.tag}`}>{msg.tag}</span>
              )}
              {msg.routingKey && (
                <span className="tag tag-info">{msg.routingKey}</span>
              )}
              <span>{msg.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
