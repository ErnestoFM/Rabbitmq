/**
 * 05 - Topics: Producer
 *
 * Uses a TOPIC exchange for flexible, pattern-based routing.
 * Routing keys follow a dot-separated format: <facility>.<severity>
 */
const { connect, disconnect } = require("../config/connection");

const EXCHANGE = "topic_logs";

async function main() {
  const { connection, channel } = await connect();

  await channel.assertExchange(EXCHANGE, "topic", { durable: false });

  const logs = [
    { key: "auth.info", message: "User signed in" },
    { key: "auth.error", message: "Invalid credentials" },
    { key: "order.info", message: "Order #99 created" },
    { key: "order.error", message: "Payment declined" },
    { key: "system.warning", message: "CPU at 90%" },
    { key: "system.error", message: "Out of memory" },
  ];

  for (const log of logs) {
    channel.publish(EXCHANGE, log.key, Buffer.from(log.message));
    console.log(`[✓] Sent [${log.key}]: "${log.message}"`);
  }

  await disconnect(connection, channel);
}

main().catch(console.error);
