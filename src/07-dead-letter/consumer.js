/**
 * 07 - Dead Letter Exchange: Consumer
 *
 * Consumes from the work queue. Messages containing "fail" are
 * rejected (nack without requeue) and land on the dead letter queue.
 * A second consumer reads the dead letter queue for monitoring.
 */
const { connect } = require("../config/connection");

const DLX_EXCHANGE = "dlx_exchange";
const DLX_QUEUE = "dead_letter_queue";
const WORK_EXCHANGE = "work_exchange";
const WORK_QUEUE = "work_queue";

async function main() {
  const { channel } = await connect();

  // Ensure infrastructure exists
  await channel.assertExchange(DLX_EXCHANGE, "fanout", { durable: true });
  await channel.assertQueue(DLX_QUEUE, { durable: true });
  await channel.bindQueue(DLX_QUEUE, DLX_EXCHANGE, "");

  await channel.assertExchange(WORK_EXCHANGE, "direct", { durable: true });
  await channel.assertQueue(WORK_QUEUE, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": DLX_EXCHANGE,
      "x-message-ttl": 10000,
    },
  });
  await channel.bindQueue(WORK_QUEUE, WORK_EXCHANGE, "task");

  channel.prefetch(1);

  // Main consumer
  console.log(`[*] Consuming from "${WORK_QUEUE}". Press CTRL+C to exit.`);
  channel.consume(WORK_QUEUE, (msg) => {
    if (msg) {
      const body = msg.content.toString();
      if (body.includes("fail")) {
        console.log(`[✗] Rejected: "${body}" → dead letter queue`);
        channel.nack(msg, false, false); // reject without requeue
      } else {
        console.log(`[✓] Processed: "${body}"`);
        channel.ack(msg);
      }
    }
  });

  // Dead letter consumer
  console.log(`[*] Monitoring "${DLX_QUEUE}" for dead letters.`);
  channel.consume(DLX_QUEUE, (msg) => {
    if (msg) {
      console.log(`[☠] Dead letter: "${msg.content.toString()}"`);
      channel.ack(msg);
    }
  });
}

main().catch(console.error);
