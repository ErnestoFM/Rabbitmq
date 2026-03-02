const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

/**
 * Creates a connection and channel to RabbitMQ.
 * @returns {Promise<{connection: amqp.Connection, channel: amqp.Channel}>}
 */
async function connect() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  return { connection, channel };
}

/**
 * Gracefully closes the channel and connection.
 * @param {amqp.Connection} connection
 * @param {amqp.Channel} channel
 */
async function disconnect(connection, channel) {
  if (channel) await channel.close();
  if (connection) await connection.close();
}

module.exports = { connect, disconnect, RABBITMQ_URL };
