import jwt from "jsonwebtoken";
import { authMiddleware, adminMiddleware as authAdminMiddleware } from "../src/middlewares/auth.middleware";

jest.mock("jsonwebtoken");

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

type Req = any;
type Res = any;

const makeRes = (): Res => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth middleware extra unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("extracts token after Bearer prefix", () => {
    const req: Req = { headers: { authorization: "Bearer token-123" } };
    const res = makeRes();
    const next = jest.fn();
    mockedJwt.verify.mockReturnValue({ id: "abc" } as any);

    authMiddleware(req, res, next);

    expect(mockedJwt.verify).toHaveBeenCalledWith("token-123", expect.any(String));
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("handles malformed authorization value", () => {
    const req: Req = { headers: { authorization: "broken-header" } };
    const res = makeRes();
    const next = jest.fn();
    mockedJwt.verify.mockImplementation(() => {
      throw new Error("bad");
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("handles jwt payload without id by setting undefined userId", () => {
    const req: Req = { headers: { authorization: "Bearer token" } };
    const res = makeRes();
    const next = jest.fn();
    mockedJwt.verify.mockReturnValue({} as any);

    authMiddleware(req, res, next);

    expect(req.userId).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("adminMiddleware accepts literal admin role object", async () => {
    const req: Req = { userId: { role: "admin" } };
    const res = makeRes();
    const next = jest.fn();

    await authAdminMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("adminMiddleware rejects string userId without role", async () => {
    const req: Req = { userId: "u1" };
    const res = makeRes();
    const next = jest.fn();

    await authAdminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("adminMiddleware keeps success false in error JSON", async () => {
    const req: Req = { userId: { role: "user" } };
    const res = makeRes();
    const next = jest.fn();

    await authAdminMiddleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  it("auth middleware returns standardized invalid token message", () => {
    const req: Req = { headers: { authorization: "Bearer bad" } };
    const res = makeRes();
    const next = jest.fn();
    mockedJwt.verify.mockImplementation(() => {
      throw new Error("jwt expired");
    });

    authMiddleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });
  });

  it("auth middleware does not call res.status on valid token", () => {
    const req: Req = { headers: { authorization: "Bearer ok" } };
    const res = makeRes();
    const next = jest.fn();
    mockedJwt.verify.mockReturnValue({ id: "u1" } as any);

    authMiddleware(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
