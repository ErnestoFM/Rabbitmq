# RabbitMQ Practice Project

A professional, hands-on project for learning and practicing all core RabbitMQ messaging patterns using **Node.js** and **amqplib**.

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [Docker](https://www.docker.com/) and Docker Compose

## Quick Start

### 1. Start RabbitMQ

```bash
docker compose up -d
```

The management UI is available at [http://localhost:15672](http://localhost:15672) (user: `guest`, password: `guest`).

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Examples

Each example is self-contained. Open **two terminals** — one for the consumer/subscriber/server, and another for the producer/publisher/client.

---

## Examples

### 01 — Basic (Point-to-Point)

The simplest pattern: one producer sends a message directly to a named queue, one consumer reads it.

```bash
# Terminal 1
npm run basic:consumer

# Terminal 2
npm run basic:producer
```

### 02 — Work Queues (Competing Consumers)

Multiple workers share a task queue. Each task is delivered to exactly one worker. Uses `prefetch(1)` for fair dispatch and manual acknowledgments.

```bash
# Terminal 1 (worker A)
npm run work:worker

# Terminal 2 (worker B)
npm run work:worker

# Terminal 3
npm run work:producer
```

### 03 — Publish/Subscribe (Fanout Exchange)

A fanout exchange broadcasts every message to all bound queues. Each subscriber receives a copy.

```bash
# Terminal 1
npm run pubsub:subscriber

# Terminal 2
npm run pubsub:subscriber

# Terminal 3
npm run pubsub:publisher
```

### 04 — Routing (Direct Exchange)

A direct exchange routes messages to queues whose binding key matches the routing key exactly.

```bash
# Terminal 1 — receives only errors
node src/04-routing/consumer.js error

# Terminal 2 — receives info and warning
node src/04-routing/consumer.js info warning

# Terminal 3
npm run routing:producer
```

### 05 — Topics (Topic Exchange)

A topic exchange routes messages using wildcard patterns:
- `*` matches exactly one word
- `#` matches zero or more words

```bash
# Terminal 1 — all auth messages
node src/05-topics/consumer.js "auth.*"

# Terminal 2 — all errors
node src/05-topics/consumer.js "*.error"

# Terminal 3
npm run topics:producer
```

### 06 — RPC (Remote Procedure Call)

Request/reply pattern using a temporary reply queue and `correlationId`.

```bash
# Terminal 1
npm run rpc:server

# Terminal 2
node src/06-rpc/client.js 30
```

### 07 — Dead Letter Exchange (DLX)

Messages that are rejected or expire are automatically routed to a dead letter exchange for monitoring or retry.

```bash
# Terminal 1
npm run dlx:consumer

# Terminal 2
npm run dlx:producer
```

---

## Project Structure

```
├── docker-compose.yml            # RabbitMQ + Management UI
├── package.json
├── src/
│   ├── config/
│   │   └── connection.js         # Shared connection helper
│   ├── 01-basic/                 # Point-to-point messaging
│   ├── 02-work-queues/           # Competing consumers
│   ├── 03-pub-sub/               # Fanout exchange
│   ├── 04-routing/               # Direct exchange
│   ├── 05-topics/                # Topic exchange
│   ├── 06-rpc/                   # Remote Procedure Call
│   └── 07-dead-letter/           # Dead Letter Exchange
└── tests/                        # Unit tests
```

## Key Concepts Covered

| # | Pattern | Exchange Type | Description |
|---|---------|--------------|-------------|
| 01 | Basic | *(default)* | Simple point-to-point messaging |
| 02 | Work Queues | *(default)* | Task distribution with fair dispatch |
| 03 | Pub/Sub | `fanout` | Broadcast to all subscribers |
| 04 | Routing | `direct` | Route by exact routing key |
| 05 | Topics | `topic` | Route by wildcard patterns |
| 06 | RPC | *(default)* | Request/reply with correlation |
| 07 | Dead Letter | `fanout` + `direct` | Failed message handling |

## Tests

```bash
npm test
```

## License

GPL-3.0
