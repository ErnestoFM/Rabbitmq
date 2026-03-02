/**
 * 02 - Work Queues: Producer
 *
 * Sends multiple tasks to a queue. Each task simulates a different
 * amount of work by using dots in the message (each dot = 1 second).
 * Workers will compete to consume these tasks (round-robin dispatch).
 */
const { connect, disconnect } = require("../config/connection");

const QUEUE = "task_queue";

async function main() {
  const { connection, channel } = await connect();

  await channel.assertQueue(QUEUE, { durable: true });

  const tasks = [
    "task.short",
    "task.medium..",
    "task.long....",
    "task.quick",
    "task.heavy.....",
  ];

  for (const task of tasks) {
    channel.sendToQueue(QUEUE, Buffer.from(task), { persistent: true });
    console.log(`[✓] Sent task: "${task}"`);
  }

  await disconnect(connection, channel);
}

main().catch(console.error);
