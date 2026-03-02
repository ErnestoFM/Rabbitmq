/**
 * 06 - RPC: Server
 *
 * Listens on the "rpc_queue" for requests containing a number (n).
 * Computes the Fibonacci of n and replies to the client via the
 * replyTo queue with the matching correlationId.
 */
const { connect } = require("../config/connection");

const QUEUE = "rpc_queue";

function fibonacci(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

async function main() {
  const { channel } = await connect();

  await channel.assertQueue(QUEUE, { durable: false });
  channel.prefetch(1);

  console.log(`[*] RPC Server awaiting requests. Press CTRL+C to exit.`);

  channel.consume(QUEUE, (msg) => {
    if (msg) {
      const n = parseInt(msg.content.toString(), 10);
      console.log(`[…] Computing fibonacci(${n})…`);
      const result = fibonacci(n);
      console.log(`[✓] fibonacci(${n}) = ${result}`);

      channel.sendToQueue(msg.properties.replyTo, Buffer.from(result.toString()), {
        correlationId: msg.properties.correlationId,
      });

      channel.ack(msg);
    }
  });
}

module.exports = { fibonacci };

if (require.main === module) {
  main().catch(console.error);
}
