import jwt from "jsonwebtoken";
import { authMiddleware, adminMiddleware as authAdminMiddleware } from "../src/middlewares/auth.middleware";
import { authorizedMiddleware, adminMiddleware as authorizedAdminMiddleware } from "../src/middlewares/authorized.middleware";

jest.mock("jsonwebtoken");

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

jest.mock("../src/infrastructure/repositories/user.repository", () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => ({
      getUserById: jest.fn(),
    })),
  };
});

const { UserRepository } = jest.requireMock("../src/infrastructure/repositories/user.repository");

type Req = any;
type Res = any;

const makeRes = (): Res => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth.middleware.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when token is missing", () => {
    const req: Req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No token provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token verification fails", () => {
    const req: Req = { headers: { authorization: "Bearer bad-token" } };
    const res = makeRes();
    const next = jest.fn();
    mockedJwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("sets req.userId and calls next for valid token", () => {
    const req: Req = { headers: { authorization: "Bearer good-token" } };
    const res = makeRes();
    const next = jest.fn();
    mockedJwt.verify.mockReturnValue({ id: "user-1" } as any);

    authMiddleware(req, res, next);

    expect(req.userId).toBe("user-1");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("adminMiddleware returns 401 when req.userId missing", async () => {
    const req: Req = {};
    const res = makeRes();
    const next = jest.fn();

    await authAdminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized no user info",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("adminMiddleware returns 403 for non-admin role", async () => {
    const req: Req = { userId: { role: "user" } };
    const res = makeRes();
    const next = jest.fn();

    await authAdminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden not admin",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("adminMiddleware calls next for admin role", async () => {
    const req: Req = { userId: { role: "admin" } };
    const res = makeRes();
    const next = jest.fn();

    await authAdminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("authorized.middleware.ts", () => {
  let getUserByIdMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    getUserByIdMock = jest.fn();
    UserRepository.mockImplementation(() => ({
      getUserById: getUserByIdMock,
    }));
  });

  it("returns 401 when auth header is missing", async () => {
    const req: Req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when header does not start with Bearer", async () => {
    const req: Req = { headers: { authorization: "Token abc" } };
    const res = makeRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when jwt is invalid", async () => {
    const req: Req = { headers: { authorization: "Bearer broken" } };
    const res = makeRes();
    const next = jest.fn();
    const jwtErr: any = new Error("jwt malformed");
    jwtErr.name = "JsonWebTokenError";
    mockedJwt.verify.mockImplementation(() => {
      throw jwtErr;
    });

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when decoded token has no id", async () => {
    const req: Req = { headers: { authorization: "Bearer ok" } };
    const res = makeRes();
    const next = jest.fn();
    mockedJwt.verify.mockReturnValue({} as any);

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when user not found", async () => {
    const req: Req = { headers: { authorization: "Bearer ok" } };
    const res = makeRes();
    const next = jest.fn();
    mockedJwt.verify.mockReturnValue({ id: "u1" } as any);
    getUserByIdMock.mockResolvedValue(null);

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("authorized adminMiddleware returns 401 if req.user missing", () => {
    const req: Req = {};
    const res = makeRes();
    const next = jest.fn();

    authorizedAdminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("authorized adminMiddleware returns 403 for non-admin", () => {
    const req: Req = { user: { role: "user", firstName: "U" } };
    const res = makeRes();
    const next = jest.fn();

    authorizedAdminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("authorized adminMiddleware calls next for admin", () => {
    const req: Req = { user: { role: "admin", firstName: "A" } };
    const res = makeRes();
    const next = jest.fn();

    authorizedAdminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
