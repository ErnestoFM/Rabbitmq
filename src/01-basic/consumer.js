/**
 * 01 - Basic Consumer
 *
 * Listens on a named queue and processes messages one by one.
 */
const { connect } = require("../config/connection");

const QUEUE = "basic_queue";

async function main() {
  const { channel } = await connect();

  await channel.assertQueue(QUEUE, { durable: true });
  console.log(`[*] Waiting for messages in "${QUEUE}". Press CTRL+C to exit.`);

  channel.consume(QUEUE, (msg) => {
    if (msg) {
      console.log(`[✓] Received: "${msg.content.toString()}"`);
      channel.ack(msg);
    }
  });
}

main().catch(console.error);
