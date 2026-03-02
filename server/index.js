const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const { connect, disconnect } = require("../src/config/connection");
const { fibonacci } = require("../src/06-rpc/server");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Serve React build in production
app.use(express.static(path.join(__dirname, "../client/dist")));

// ── Active consumers (so we can stop them) ──────────────────────────
const consumers = {}; // { socketId_pattern: { channel, connection, tag } }

// ── Helper: emit to a specific socket ───────────────────────────────
function emitMessage(socketId, event, data) {
  io.to(socketId).emit(event, { ...data, timestamp: new Date().toISOString() });
}

// ── REST API ────────────────────────────────────────────────────────

// 01 - Basic: send a message
app.post("/api/basic/send", async (req, res) => {
  try {
    const { message } = req.body;
    const { connection, channel } = await connect();
    await channel.assertQueue("basic_queue", { durable: true });
    channel.sendToQueue("basic_queue", Buffer.from(message || "Hello RabbitMQ!"), {
      persistent: true,
    });
    await disconnect(connection, channel);
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 02 - Work Queues: send tasks
app.post("/api/work-queues/send", async (req, res) => {
  try {
    const { task } = req.body;
    const { connection, channel } = await connect();
    await channel.assertQueue("task_queue", { durable: true });
    channel.sendToQueue("task_queue", Buffer.from(task || "task.default"), {
      persistent: true,
    });
    await disconnect(connection, channel);
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 03 - Pub/Sub: publish a log message
app.post("/api/pub-sub/publish", async (req, res) => {
  try {
    const { message } = req.body;
    const { connection, channel } = await connect();
    await channel.assertExchange("logs", "fanout", { durable: false });
    channel.publish("logs", "", Buffer.from(message || "Log message"));
    await disconnect(connection, channel);
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 04 - Routing: send a log with severity
app.post("/api/routing/send", async (req, res) => {
  try {
    const { severity, message } = req.body;
    const { connection, channel } = await connect();
    await channel.assertExchange("direct_logs", "direct", { durable: false });
    channel.publish("direct_logs", severity || "info", Buffer.from(message || "Log"));
    await disconnect(connection, channel);
    res.json({ success: true, severity, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 05 - Topics: send a topic message
app.post("/api/topics/send", async (req, res) => {
  try {
    const { routingKey, message } = req.body;
    const { connection, channel } = await connect();
    await channel.assertExchange("topic_logs", "topic", { durable: false });
    channel.publish("topic_logs", routingKey || "anonymous.info", Buffer.from(message || "Message"));
    await disconnect(connection, channel);
    res.json({ success: true, routingKey, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 06 - RPC: compute fibonacci
app.post("/api/rpc/compute", async (req, res) => {
  try {
    const { number } = req.body;
    const n = parseInt(number, 10) || 10;
    const result = fibonacci(n);
    res.json({ success: true, input: n, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 07 - Dead Letter: send a message
app.post("/api/dead-letter/send", async (req, res) => {
  try {
    const { message } = req.body;
    const { connection, channel } = await connect();
    const DLX_EXCHANGE = "dlx_exchange";
    const WORK_EXCHANGE = "work_exchange";
    const DLX_QUEUE = "dead_letter_queue";
    const WORK_QUEUE = "work_queue";

    await channel.assertExchange(DLX_EXCHANGE, "fanout", { durable: true });
    await channel.assertQueue(DLX_QUEUE, { durable: true });
    await channel.bindQueue(DLX_QUEUE, DLX_EXCHANGE, "");

    await channel.assertExchange(WORK_EXCHANGE, "direct", { durable: true });
    await channel.assertQueue(WORK_QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": DLX_EXCHANGE,
        "x-message-ttl": 10000,
      },
    });
    await channel.bindQueue(WORK_QUEUE, WORK_EXCHANGE, "task");

    channel.publish(WORK_EXCHANGE, "task", Buffer.from(message || "task-ok"), {
      persistent: true,
    });
    await disconnect(connection, channel);
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all: serve React app for any non-API route
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// ── Socket.IO: real-time consumers ──────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Start consuming from a pattern
  socket.on("subscribe", async ({ pattern, options }) => {
    const key = `${socket.id}_${pattern}`;
    if (consumers[key]) return; // already subscribed

    try {
      const { connection, channel } = await connect();
      let consumerTag;

      switch (pattern) {
        case "basic": {
          await channel.assertQueue("basic_queue", { durable: true });
          const { consumerTag: tag } = await channel.consume("basic_queue", (msg) => {
            if (msg) {
              emitMessage(socket.id, "message", {
                pattern: "basic",
                content: msg.content.toString(),
              });
              channel.ack(msg);
            }
          });
          consumerTag = tag;
          break;
        }

        case "work-queues": {
          await channel.assertQueue("task_queue", { durable: true });
          channel.prefetch(1);
          const { consumerTag: tag } = await channel.consume("task_queue", (msg) => {
            if (msg) {
              const body = msg.content.toString();
              const dots = (body.match(/\./g) || []).length;
              emitMessage(socket.id, "message", {
                pattern: "work-queues",
                content: body,
                processingTime: dots,
              });
              setTimeout(() => channel.ack(msg), dots * 1000);
            }
          });
          consumerTag = tag;
          break;
        }

        case "pub-sub": {
          await channel.assertExchange("logs", "fanout", { durable: false });
          const { queue } = await channel.assertQueue("", { exclusive: true });
          await channel.bindQueue(queue, "logs", "");
          const { consumerTag: tag } = await channel.consume(
            queue,
            (msg) => {
              if (msg) {
                emitMessage(socket.id, "message", {
                  pattern: "pub-sub",
                  content: msg.content.toString(),
                });
              }
            },
            { noAck: true }
          );
          consumerTag = tag;
          break;
        }

        case "routing": {
          const severities = options?.severities || ["info", "warning", "error"];
          await channel.assertExchange("direct_logs", "direct", { durable: false });
          const { queue } = await channel.assertQueue("", { exclusive: true });
          for (const sev of severities) {
            await channel.bindQueue(queue, "direct_logs", sev);
          }
          const { consumerTag: tag } = await channel.consume(
            queue,
            (msg) => {
              if (msg) {
                emitMessage(socket.id, "message", {
                  pattern: "routing",
                  routingKey: msg.fields.routingKey,
                  content: msg.content.toString(),
                });
              }
            },
            { noAck: true }
          );
          consumerTag = tag;
          break;
        }

        case "topics": {
          const patterns = options?.patterns || ["#"];
          await channel.assertExchange("topic_logs", "topic", { durable: false });
          const { queue } = await channel.assertQueue("", { exclusive: true });
          for (const p of patterns) {
            await channel.bindQueue(queue, "topic_logs", p);
          }
          const { consumerTag: tag } = await channel.consume(
            queue,
            (msg) => {
              if (msg) {
                emitMessage(socket.id, "message", {
                  pattern: "topics",
                  routingKey: msg.fields.routingKey,
                  content: msg.content.toString(),
                });
              }
            },
            { noAck: true }
          );
          consumerTag = tag;
          break;
        }

        case "dead-letter": {
          const DLX_EXCHANGE = "dlx_exchange";
          const DLX_QUEUE = "dead_letter_queue";
          const WORK_EXCHANGE = "work_exchange";
          const WORK_QUEUE = "work_queue";

          await channel.assertExchange(DLX_EXCHANGE, "fanout", { durable: true });
          await channel.assertQueue(DLX_QUEUE, { durable: true });
          await channel.bindQueue(DLX_QUEUE, DLX_EXCHANGE, "");
          await channel.assertExchange(WORK_EXCHANGE, "direct", { durable: true });
          await channel.assertQueue(WORK_QUEUE, {
            durable: true,
            arguments: {
              "x-dead-letter-exchange": DLX_EXCHANGE,
              "x-message-ttl": 10000,
            },
          });
          await channel.bindQueue(WORK_QUEUE, WORK_EXCHANGE, "task");
          channel.prefetch(1);

          await channel.consume(WORK_QUEUE, (msg) => {
            if (msg) {
              const body = msg.content.toString();
              if (body.includes("fail")) {
                emitMessage(socket.id, "message", {
                  pattern: "dead-letter",
                  type: "rejected",
                  content: body,
                });
                channel.nack(msg, false, false);
              } else {
                emitMessage(socket.id, "message", {
                  pattern: "dead-letter",
                  type: "processed",
                  content: body,
                });
                channel.ack(msg);
              }
            }
          });

          const { consumerTag: tag } = await channel.consume(DLX_QUEUE, (msg) => {
            if (msg) {
              emitMessage(socket.id, "message", {
                pattern: "dead-letter",
                type: "dead-letter",
                content: msg.content.toString(),
              });
              channel.ack(msg);
            }
          });
          consumerTag = tag;
          break;
        }

        default:
          socket.emit("error", { message: `Unknown pattern: ${pattern}` });
          await disconnect(connection, channel);
          return;
      }

      consumers[key] = { connection, channel, tag: consumerTag };
      socket.emit("subscribed", { pattern });
      console.log(`[WS] ${socket.id} subscribed to ${pattern}`);
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  // Stop consuming
  socket.on("unsubscribe", async ({ pattern }) => {
    const key = `${socket.id}_${pattern}`;
    const consumer = consumers[key];
    if (consumer) {
      try {
        await disconnect(consumer.connection, consumer.channel);
      } catch {
        // ignore cleanup errors
      }
      delete consumers[key];
      socket.emit("unsubscribed", { pattern });
      console.log(`[WS] ${socket.id} unsubscribed from ${pattern}`);
    }
  });

  // Clean up on disconnect
  socket.on("disconnect", async () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
    const prefix = `${socket.id}_`;
    for (const key of Object.keys(consumers)) {
      if (key.startsWith(prefix)) {
        try {
          await disconnect(consumers[key].connection, consumers[key].channel);
        } catch {
          // ignore cleanup errors
        }
        delete consumers[key];
      }
    }
  });
});

// ── Start server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
