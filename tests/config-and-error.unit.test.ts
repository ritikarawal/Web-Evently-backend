describe("HttpError", () => {
  it("stores status code and message", async () => {
    const { HttpError } = await import("../src/errors/http-error");
    const err = new HttpError(422, "Invalid input");
    expect(err.statusCode).toBe(422);
    expect(err.message).toBe("Invalid input");
  });

  it("is instance of Error", async () => {
    const { HttpError } = await import("../src/errors/http-error");
    expect(new HttpError(400, "x")).toBeInstanceOf(Error);
  });

  it("supports multiple status codes", async () => {
    const { HttpError } = await import("../src/errors/http-error");
    expect(new HttpError(401, "a").statusCode).toBe(401);
    expect(new HttpError(403, "b").statusCode).toBe(403);
    expect(new HttpError(500, "c").statusCode).toBe(500);
  });
});

describe("config values", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses explicit PORT env", async () => {
    process.env.PORT = "6010";
    const cfg = await import("../src/config");

    expect(cfg.PORT).toBe(6010);
  });

  it("uses explicit MONGO_URI env", async () => {
    process.env.MONGO_URI = "mongodb://forced-uri";
    const cfg = await import("../src/config");

    expect(cfg.MONGODB_URI).toBe("mongodb://forced-uri");
  });

  it("uses explicit JWT_SECRET env", async () => {
    process.env.JWT_SECRET = "forced-secret";
    const cfg = await import("../src/config");

    expect(cfg.JWT_SECRET).toBe("forced-secret");
  });

  it("returns numeric PORT type", async () => {
    const cfg = await import("../src/config");

    expect(typeof cfg.PORT).toBe("number");
  });

  it("returns non-empty mongodb uri", async () => {
    const cfg = await import("../src/config");

    expect(typeof cfg.MONGODB_URI).toBe("string");
    expect(cfg.MONGODB_URI.length).toBeGreaterThan(0);
  });

  it("returns non-empty jwt secret", async () => {
    const cfg = await import("../src/config");

    expect(typeof cfg.JWT_SECRET).toBe("string");
    expect(cfg.JWT_SECRET.length).toBeGreaterThan(0);
  });
});
