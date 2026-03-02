/**
 * 03 - Publish/Subscribe: Subscriber
 *
 * Creates an exclusive, auto-delete queue and binds it to a FANOUT
 * exchange. Each subscriber instance gets its own queue, so every
 * running subscriber receives all messages.
 */
const { connect } = require("../config/connection");

const EXCHANGE = "logs";

async function main() {
  const { channel } = await connect();

  await channel.assertExchange(EXCHANGE, "fanout", { durable: false });

  // Create a temporary, exclusive queue (auto-deleted when consumer disconnects)
  const { queue } = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(queue, EXCHANGE, "");

  console.log(`[*] Subscriber waiting for logs. Press CTRL+C to exit.`);

  channel.consume(queue, (msg) => {
    if (msg) {
      console.log(`[✓] Received log: "${msg.content.toString()}"`);
    }
  }, { noAck: true });
}

main().catch(console.error);
