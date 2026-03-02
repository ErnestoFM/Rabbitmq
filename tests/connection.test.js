const { connect, disconnect, RABBITMQ_URL } = require("../src/config/connection");
const amqp = require("amqplib");

jest.mock("amqplib");

describe("connection", () => {
  const mockChannel = {
    close: jest.fn().mockResolvedValue(undefined),
  };
  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
    close: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    amqp.connect.mockResolvedValue(mockConnection);
  });

  test("RABBITMQ_URL has a default value", () => {
    expect(RABBITMQ_URL).toBe("amqp://guest:guest@localhost:5672");
  });

  test("connect() returns connection and channel", async () => {
    const { connection, channel } = await connect();

    expect(amqp.connect).toHaveBeenCalledWith(RABBITMQ_URL);
    expect(connection).toBe(mockConnection);
    expect(channel).toBe(mockChannel);
  });

  test("disconnect() closes channel and connection", async () => {
    await disconnect(mockConnection, mockChannel);

    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
  });

  test("disconnect() handles null channel gracefully", async () => {
    await disconnect(mockConnection, null);

    expect(mockConnection.close).toHaveBeenCalled();
  });

  test("disconnect() handles null connection gracefully", async () => {
    await disconnect(null, mockChannel);

    expect(mockChannel.close).toHaveBeenCalled();
  });
});
