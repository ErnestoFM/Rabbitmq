/**
 * 03 - Publish/Subscribe: Publisher
 *
 * Uses a FANOUT exchange to broadcast messages to all bound queues.
 * Every subscriber receives a copy of each message.
 */
const { connect, disconnect } = require("../config/connection");

const EXCHANGE = "logs";

async function main() {
  const { connection, channel } = await connect();

  await channel.assertExchange(EXCHANGE, "fanout", { durable: false });

  const messages = [
    "INFO: Application started",
    "WARNING: Disk usage at 85%",
    "ERROR: Database connection lost",
  ];

  for (const msg of messages) {
    channel.publish(EXCHANGE, "", Buffer.from(msg));
    console.log(`[✓] Published: "${msg}"`);
  }

  await disconnect(connection, channel);
}

main().catch(console.error);
