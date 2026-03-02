/**
 * 04 - Routing: Consumer
 *
 * Binds to specific severity levels on a DIRECT exchange.
 * Usage: node consumer.js info warning error
 */
const { connect } = require("../config/connection");

const EXCHANGE = "direct_logs";

async function main() {
  const severities = process.argv.slice(2);
  if (severities.length === 0) {
    console.log("Usage: node consumer.js [info] [warning] [error]");
    process.exit(1);
  }

  const { channel } = await connect();

  await channel.assertExchange(EXCHANGE, "direct", { durable: false });

  const { queue } = await channel.assertQueue("", { exclusive: true });

  for (const severity of severities) {
    await channel.bindQueue(queue, EXCHANGE, severity);
  }

  console.log(`[*] Listening for [${severities.join(", ")}]. Press CTRL+C to exit.`);

  channel.consume(queue, (msg) => {
    if (msg) {
      console.log(`[✓] [${msg.fields.routingKey}]: "${msg.content.toString()}"`);
    }
  }, { noAck: true });
}

main().catch(console.error);
