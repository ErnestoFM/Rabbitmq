# RabbitMQ Web Dashboard

A full-stack web application for learning and practicing all core RabbitMQ messaging patterns, built with **React**, **Express**, **Socket.IO**, and **amqplib**.

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [Docker](https://www.docker.com/) and Docker Compose

## Quick Start

### 1. Start RabbitMQ

```bash
docker compose up -d
```

The RabbitMQ management UI is available at [http://localhost:15672](http://localhost:15672) (user: `guest`, password: `guest`).

### 2. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Run in Development Mode

```bash
npm run dev
```

This starts both the Express backend (port 3001) and the Vite dev server (port 5173) concurrently.

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run in Production Mode

```bash
npm start
```

This builds the React client and serves everything from the Express server on port 3001.

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Architecture

```
├── server/
│   └── index.js                  # Express + Socket.IO backend
├── client/                       # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx               # Main app with tab navigation
│   │   ├── panels/               # UI panels for each pattern
│   │   │   ├── BasicPanel.jsx
│   │   │   ├── WorkQueuesPanel.jsx
│   │   │   ├── PubSubPanel.jsx
│   │   │   ├── RoutingPanel.jsx
│   │   │   ├── TopicsPanel.jsx
│   │   │   ├── RpcPanel.jsx
│   │   │   └── DeadLetterPanel.jsx
│   │   └── index.css             # Global styles
│   └── vite.config.js
├── src/                          # Core RabbitMQ logic (console scripts)
│   ├── config/
│   │   └── connection.js         # Shared connection helper
│   ├── 01-basic/
│   ├── 02-work-queues/
│   ├── 03-pub-sub/
│   ├── 04-routing/
│   ├── 05-topics/
│   ├── 06-rpc/
│   └── 07-dead-letter/
├── tests/                        # Unit tests
├── docker-compose.yml            # RabbitMQ + Management UI
└── package.json
```

## Messaging Patterns

The dashboard provides an interactive UI for all 7 patterns:

| # | Pattern | Exchange Type | Description |
|---|---------|--------------|-------------|
| 01 | Basic | *(default)* | Simple point-to-point messaging |
| 02 | Work Queues | *(default)* | Task distribution with fair dispatch |
| 03 | Pub/Sub | `fanout` | Broadcast to all subscribers |
| 04 | Routing | `direct` | Route by exact routing key |
| 05 | Topics | `topic` | Route by wildcard patterns |
| 06 | RPC | *(default)* | Request/reply with Fibonacci computation |
| 07 | Dead Letter | `fanout` + `direct` | Failed message handling |

### Using the Dashboard

1. **Select a pattern** using the tabs at the top
2. **Start a consumer/subscriber** by clicking the green button
3. **Send messages** using the form and the orange button
4. **Watch messages** appear in real-time in the message log
5. **Stop the consumer** when done

## Console Scripts (Legacy)

The original console scripts are still available:

```bash
# Example: Basic pattern
npm run basic:consumer   # Terminal 1
npm run basic:producer   # Terminal 2
```

See each folder in `src/` for the full list of scripts.

## Tests

```bash
npm test
```

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Express 5 + Socket.IO 4
- **Messaging**: RabbitMQ via amqplib
- **Real-time**: WebSocket (Socket.IO)

## License

GPL-3.0
