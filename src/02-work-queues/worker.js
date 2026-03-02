/**
 * 02 - Work Queues: Worker
 *
 * Consumes tasks from the queue. Uses manual acknowledgments and
 * prefetch(1) to ensure fair dispatch: a worker only gets a new
 * task after it finishes the current one.
 */
const { connect } = require("../config/connection");

const QUEUE = "task_queue";

async function main() {
  const { channel } = await connect();

  await channel.assertQueue(QUEUE, { durable: true });

  // Fair dispatch: don't send more than 1 message to a worker at a time
  channel.prefetch(1);
  console.log(`[*] Worker waiting for tasks in "${QUEUE}". Press CTRL+C to exit.`);

  channel.consume(QUEUE, (msg) => {
    if (msg) {
      const body = msg.content.toString();
      const dots = (body.match(/\./g) || []).length;
      console.log(`[…] Processing: "${body}" (${dots}s)`);

      // Simulate work with a timeout based on dot count
      setTimeout(() => {
        console.log(`[✓] Done: "${body}"`);
        channel.ack(msg);
      }, dots * 1000);
    }
  });
}

main().catch(console.error);
