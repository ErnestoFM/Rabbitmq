/**
 * 01 - Basic Producer
 *
 * Sends a single message to a named queue.
 * This is the simplest RabbitMQ pattern: point-to-point messaging.
 */
const { connect, disconnect } = require("../config/connection");

const QUEUE = "basic_queue";

async function main() {
  const { connection, channel } = await connect();

  // Ensure the queue exists (durable: survives broker restart)
  await channel.assertQueue(QUEUE, { durable: true });

  const message = process.argv[2] || "Hello RabbitMQ!";
  channel.sendToQueue(QUEUE, Buffer.from(message), { persistent: true });
  console.log(`[✓] Sent: "${message}"`);

  await disconnect(connection, channel);
}

main().catch(console.error);
