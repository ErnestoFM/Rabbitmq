/**
 * 07 - Dead Letter Exchange: Producer
 *
 * Sends messages to a queue that has a Dead Letter Exchange (DLX)
 * configured. If a message is rejected or expires, it is automatically
 * routed to the DLX for inspection or retry.
 */
const { connect, disconnect } = require("../config/connection");

const WORK_EXCHANGE = "work_exchange";
const DLX_EXCHANGE = "dlx_exchange";
const WORK_QUEUE = "work_queue";
const DLX_QUEUE = "dead_letter_queue";

async function main() {
  const { connection, channel } = await connect();

  // Set up the dead letter exchange and its queue
  await channel.assertExchange(DLX_EXCHANGE, "fanout", { durable: true });
  await channel.assertQueue(DLX_QUEUE, { durable: true });
  await channel.bindQueue(DLX_QUEUE, DLX_EXCHANGE, "");

  // Set up the work exchange and queue with DLX settings
  await channel.assertExchange(WORK_EXCHANGE, "direct", { durable: true });
  await channel.assertQueue(WORK_QUEUE, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": DLX_EXCHANGE,
      "x-message-ttl": 10000, // Messages expire after 10 seconds
    },
  });
  await channel.bindQueue(WORK_QUEUE, WORK_EXCHANGE, "task");

  const messages = [
    "task-ok-1",
    "task-fail",
    "task-ok-2",
    "task-fail",
    "task-ok-3",
  ];

  for (const msg of messages) {
    channel.publish(WORK_EXCHANGE, "task", Buffer.from(msg), { persistent: true });
    console.log(`[✓] Sent: "${msg}"`);
  }

  await disconnect(connection, channel);
}

module.exports = { WORK_QUEUE, DLX_QUEUE, WORK_EXCHANGE, DLX_EXCHANGE };

if (require.main === module) {
  main().catch(console.error);
}
