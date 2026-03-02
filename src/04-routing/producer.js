/**
 * 04 - Routing: Producer
 *
 * Uses a DIRECT exchange to route messages by severity level.
 * Only consumers bound to the matching routing key receive the message.
 */
const { connect, disconnect } = require("../config/connection");

const EXCHANGE = "direct_logs";

async function main() {
  const { connection, channel } = await connect();

  await channel.assertExchange(EXCHANGE, "direct", { durable: false });

  const logs = [
    { severity: "info", message: "User logged in" },
    { severity: "warning", message: "Memory usage high" },
    { severity: "error", message: "Uncaught exception in /api/users" },
    { severity: "info", message: "Order #1234 placed" },
    { severity: "error", message: "Payment gateway timeout" },
  ];

  for (const log of logs) {
    channel.publish(EXCHANGE, log.severity, Buffer.from(log.message));
    console.log(`[✓] Sent [${log.severity}]: "${log.message}"`);
  }

  await disconnect(connection, channel);
}

main().catch(console.error);
