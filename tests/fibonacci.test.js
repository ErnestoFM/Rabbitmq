const { fibonacci } = require("../src/06-rpc/server");

describe("fibonacci", () => {
  test("fibonacci(0) = 0", () => {
    expect(fibonacci(0)).toBe(0);
  });

  test("fibonacci(1) = 1", () => {
    expect(fibonacci(1)).toBe(1);
  });

  test("fibonacci(2) = 1", () => {
    expect(fibonacci(2)).toBe(1);
  });

  test("fibonacci(10) = 55", () => {
    expect(fibonacci(10)).toBe(55);
  });

  test("fibonacci(20) = 6765", () => {
    expect(fibonacci(20)).toBe(6765);
  });

  test("fibonacci handles negative input", () => {
    expect(fibonacci(-1)).toBe(0);
  });
});
