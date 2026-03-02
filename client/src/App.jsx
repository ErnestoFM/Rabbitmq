import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import BasicPanel from "./panels/BasicPanel.jsx";
import WorkQueuesPanel from "./panels/WorkQueuesPanel.jsx";
import PubSubPanel from "./panels/PubSubPanel.jsx";
import RoutingPanel from "./panels/RoutingPanel.jsx";
import TopicsPanel from "./panels/TopicsPanel.jsx";
import RpcPanel from "./panels/RpcPanel.jsx";
import DeadLetterPanel from "./panels/DeadLetterPanel.jsx";

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || window.location.origin;

const PATTERNS = [
  { id: "basic", label: "01 · Basic" },
  { id: "work-queues", label: "02 · Work Queues" },
  { id: "pub-sub", label: "03 · Pub/Sub" },
  { id: "routing", label: "04 · Routing" },
  { id: "topics", label: "05 · Topics" },
  { id: "rpc", label: "06 · RPC" },
  { id: "dead-letter", label: "07 · Dead Letter" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("basic");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const [subscriptions, setSubscriptions] = useState({});
  const socketRef = useRef(null);

  const addMessage = useCallback((pattern, msg) => {
    setMessages((prev) => ({
      ...prev,
      [pattern]: [...(prev[pattern] || []), msg],
    }));
  }, []);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("message", (data) => {
      addMessage(data.pattern, data);
    });

    socket.on("subscribed", ({ pattern }) => {
      setSubscriptions((prev) => ({ ...prev, [pattern]: true }));
    });

    socket.on("unsubscribed", ({ pattern }) => {
      setSubscriptions((prev) => ({ ...prev, [pattern]: false }));
    });

    return () => socket.disconnect();
  }, [addMessage]);

  const subscribe = (pattern, options) => {
    socketRef.current?.emit("subscribe", { pattern, options });
  };

  const unsubscribe = (pattern) => {
    socketRef.current?.emit("unsubscribe", { pattern });
  };

  const clearMessages = (pattern) => {
    setMessages((prev) => ({ ...prev, [pattern]: [] }));
  };

  const panelProps = {
    messages,
    subscriptions,
    subscribe,
    unsubscribe,
    addMessage,
    clearMessages,
  };

  const renderPanel = () => {
    switch (activeTab) {
      case "basic":
        return <BasicPanel {...panelProps} />;
      case "work-queues":
        return <WorkQueuesPanel {...panelProps} />;
      case "pub-sub":
        return <PubSubPanel {...panelProps} />;
      case "routing":
        return <RoutingPanel {...panelProps} />;
      case "topics":
        return <TopicsPanel {...panelProps} />;
      case "rpc":
        return <RpcPanel {...panelProps} />;
      case "dead-letter":
        return <DeadLetterPanel {...panelProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐇 RabbitMQ Dashboard</h1>
        <p>Interactive web interface for all RabbitMQ messaging patterns</p>
        <div className="connection-status">
          <span className={`status-dot ${connected ? "connected" : "disconnected"}`} />
          {connected ? "Connected to server" : "Disconnected"}
        </div>
      </header>

      <nav className="tabs">
        {PATTERNS.map((p) => (
          <button
            key={p.id}
            className={`tab-btn ${activeTab === p.id ? "active" : ""}`}
            onClick={() => setActiveTab(p.id)}
          >
            {p.label}
            {subscriptions[p.id] && " 🟢"}
          </button>
        ))}
      </nav>

      {renderPanel()}
    </div>
  );
}
