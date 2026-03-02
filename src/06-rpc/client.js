/**
 * 06 - RPC: Client
 *
 * Sends a number to the RPC server and waits for the Fibonacci result.
 * Uses a temporary exclusive queue for replies and correlationId to
 * match responses with requests.
 */
const { connect, disconnect } = require("../config/connection");
const { randomUUID } = require("crypto");

const QUEUE = "rpc_queue";

async function main() {
  const n = parseInt(process.argv[2], 10) || 10;
  const { connection, channel } = await connect();

  const { queue: replyQueue } = await channel.assertQueue("", { exclusive: true });
  const correlationId = randomUUID();

  console.log(`[…] Requesting fibonacci(${n})…`);

  return new Promise((resolve) => {
    channel.consume(replyQueue, async (msg) => {
      if (msg && msg.properties.correlationId === correlationId) {
        console.log(`[✓] Result: fibonacci(${n}) = ${msg.content.toString()}`);
        await disconnect(connection, channel);
        resolve();
      }
    }, { noAck: true });

    channel.sendToQueue(QUEUE, Buffer.from(n.toString()), {
      correlationId,
      replyTo: replyQueue,
    });
  });
}

main().catch(console.error);
