/**
 * 05 - Topics: Consumer
 *
 * Subscribes with topic patterns using wildcards:
 *   * (star)  — matches exactly one word
 *   # (hash) — matches zero or more words
 *
 * Usage: node consumer.js "auth.*" "*.error" "#"
 */
const { connect } = require("../config/connection");

const EXCHANGE = "topic_logs";

async function main() {
  const patterns = process.argv.slice(2);
  if (patterns.length === 0) {
    console.log('Usage: node consumer.js "auth.*" "*.error" "#"');
    process.exit(1);
  }

  const { channel } = await connect();

  await channel.assertExchange(EXCHANGE, "topic", { durable: false });

  const { queue } = await channel.assertQueue("", { exclusive: true });

  for (const pattern of patterns) {
    await channel.bindQueue(queue, EXCHANGE, pattern);
  }

  console.log(`[*] Listening for [${patterns.join(", ")}]. Press CTRL+C to exit.`);

  channel.consume(queue, (msg) => {
    if (msg) {
      console.log(`[✓] [${msg.fields.routingKey}]: "${msg.content.toString()}"`);
    }
  }, { noAck: true });
}

main().catch(console.error);
