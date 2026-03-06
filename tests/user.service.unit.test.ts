import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../src/errors/http-error";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const sendEmailMock = jest.fn();

jest.mock("../src/config/email", () => ({
  sendEmail: (...args: any[]) => sendEmailMock(...args),
}));

var repoMock = {
  getUserByEmail: jest.fn(),
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  getUserById: jest.fn(),
};

jest.mock("../src/infrastructure/repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => repoMock),
}));

const { UserService } = require("../src/services/user/user.service");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

const makeUserDoc = (overrides: Record<string, any> = {}) => {
  const base = {
    _id: "u1",
    role: "user",
    email: "user@test.com",
    username: "user1",
    password: "hashed",
    firstName: "Test",
    lastName: "User",
  };
  const full = { ...base, ...overrides };
  return {
    ...full,
    toObject: () => ({ ...full }),
  };
};

describe("UserService unit", () => {
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
    process.env.CLIENT_URL = "http://localhost:3000";
  });

  it("register throws for duplicate email", async () => {
    repoMock.getUserByEmail.mockResolvedValue(makeUserDoc());
    await expect(service.register({ username: "u", email: "e@e.com", password: "p" })).rejects.toBeInstanceOf(HttpError);
  });

  it("register throws for duplicate username", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(makeUserDoc());
    await expect(service.register({ username: "u", email: "e@e.com", password: "p" })).rejects.toBeInstanceOf(HttpError);
  });

  it("register returns token and sanitized user", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("h" as never);
    repoMock.createUser.mockResolvedValue(makeUserDoc({ password: "h" }));
    mockedJwt.sign.mockReturnValue("jwt-token" as never);

    const result = await service.register({ username: "u", email: "e@e.com", password: "p" });

    expect(result.token).toBe("jwt-token");
    expect(result.user.password).toBeUndefined();
  });

  it("login throws when user missing", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    await expect(service.login({ email: "x", password: "p" })).rejects.toBeInstanceOf(HttpError);
  });

  it("login throws for invalid password", async () => {
    repoMock.getUserByEmail.mockResolvedValue(makeUserDoc());
    mockedBcrypt.compare.mockResolvedValue(false as never);
    await expect(service.login({ email: "x", password: "bad" })).rejects.toBeInstanceOf(HttpError);
  });

  it("login returns token and user", async () => {
    repoMock.getUserByEmail.mockResolvedValue(makeUserDoc());
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedJwt.sign.mockReturnValue("login-token" as never);

    const result = await service.login({ email: "x", password: "ok" });

    expect(result.token).toBe("login-token");
    expect(result.user.password).toBeUndefined();
  });

  it("updateProfilePicture throws for missing user", async () => {
    repoMock.updateUser.mockResolvedValue(null);
    await expect(service.updateProfilePicture("u1", "/img.png")).rejects.toBeInstanceOf(HttpError);
  });

  it("updateProfilePicture returns updated user", async () => {
    repoMock.updateUser.mockResolvedValue(makeUserDoc({ profilePicture: "/img.png" }));
    const result = await service.updateProfilePicture("u1", "/img.png");
    expect(result.profilePicture).toBe("/img.png");
  });

  it("getProfile throws when user not found", async () => {
    repoMock.getUserById.mockResolvedValue(null);
    await expect(service.getProfile("u1")).rejects.toBeInstanceOf(HttpError);
  });

  it("getProfile returns sanitized profile", async () => {
    repoMock.getUserById.mockResolvedValue(makeUserDoc());
    const result = await service.getProfile("u1");
    expect(result.password).toBeUndefined();
    expect(result._id).toBe("u1");
  });

  it("updateProfile throws when existing user missing", async () => {
    repoMock.getUserById.mockResolvedValue(null);
    await expect(service.updateProfile("u1", { firstName: "New" })).rejects.toBeInstanceOf(HttpError);
  });

  it("updateProfile throws for duplicate email", async () => {
    repoMock.getUserById.mockResolvedValue(makeUserDoc({ email: "old@mail.com" }));
    repoMock.getUserByEmail.mockResolvedValue(makeUserDoc({ email: "new@mail.com" }));
    await expect(service.updateProfile("u1", { email: "new@mail.com" })).rejects.toBeInstanceOf(HttpError);
  });

  it("updateProfile throws for duplicate username", async () => {
    repoMock.getUserById.mockResolvedValue(makeUserDoc({ username: "old" }));
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(makeUserDoc({ username: "new" }));
    await expect(service.updateProfile("u1", { username: "new" })).rejects.toBeInstanceOf(HttpError);
  });

  it("updateProfile hashes password when provided", async () => {
    repoMock.getUserById.mockResolvedValue(makeUserDoc());
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("hash-2" as never);
    repoMock.updateUser.mockResolvedValue(makeUserDoc({ password: "hash-2" }));

    await service.updateProfile("u1", { password: "new-pass" });

    expect(mockedBcrypt.hash).toHaveBeenCalledWith("new-pass", 10);
  });

  it("updateProfile throws when update returns null", async () => {
    repoMock.getUserById.mockResolvedValue(makeUserDoc());
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(null);
    repoMock.updateUser.mockResolvedValue(null);
    await expect(service.updateProfile("u1", { firstName: "X" })).rejects.toBeInstanceOf(HttpError);
  });

  it("updateProfile returns sanitized user", async () => {
    repoMock.getUserById.mockResolvedValue(makeUserDoc());
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(null);
    repoMock.updateUser.mockResolvedValue(makeUserDoc({ firstName: "Updated" }));

    const result = await service.updateProfile("u1", { firstName: "Updated" });

    expect(result.firstName).toBe("Updated");
    expect(result.password).toBeUndefined();
  });

  it("sendResetPasswordEmail throws when email missing", async () => {
    await expect(service.sendResetPasswordEmail(undefined)).rejects.toBeInstanceOf(HttpError);
  });

  it("sendResetPasswordEmail throws when user not found", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    await expect(service.sendResetPasswordEmail("a@b.com")).rejects.toBeInstanceOf(HttpError);
  });

  it("sendResetPasswordEmail sends mail", async () => {
    const user = makeUserDoc({ email: "a@b.com" });
    repoMock.getUserByEmail.mockResolvedValue(user);
    mockedJwt.sign.mockReturnValue("reset-token" as never);

    const result = await service.sendResetPasswordEmail("a@b.com");

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(result.email).toBe("a@b.com");
  });

  it("resetPassword throws when token/newPassword missing", async () => {
    await expect(service.resetPassword(undefined, "x")).rejects.toBeInstanceOf(HttpError);
    await expect(service.resetPassword("token", undefined)).rejects.toBeInstanceOf(HttpError);
  });

  it("resetPassword throws on verify failure", async () => {
    mockedJwt.verify.mockImplementation(() => {
      throw new Error("bad token");
    });

    await expect(service.resetPassword("bad", "new")).rejects.toBeInstanceOf(HttpError);
  });

  it("resetPassword throws when decoded user missing", async () => {
    mockedJwt.verify.mockReturnValue({ id: "missing" } as any);
    repoMock.getUserById.mockResolvedValue(null);

    await expect(service.resetPassword("good", "new")).rejects.toBeInstanceOf(HttpError);
  });

  it("resetPassword updates hashed password on success", async () => {
    mockedJwt.verify.mockReturnValue({ id: "u1" } as any);
    repoMock.getUserById.mockResolvedValue(makeUserDoc());
    mockedBcrypt.hash.mockResolvedValue("hashed-new" as never);
    repoMock.updateUser.mockResolvedValue(makeUserDoc({ password: "hashed-new" }));

    const result = await service.resetPassword("good", "new-pass");

    expect(repoMock.updateUser).toHaveBeenCalledWith("u1", { password: "hashed-new" });
    expect(result).toBeTruthy();
  });

  it("register passes role into jwt payload", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("h" as never);
    repoMock.createUser.mockResolvedValue(makeUserDoc({ role: "admin" }));
    mockedJwt.sign.mockReturnValue("jwt" as never);

    await service.register({ username: "u", email: "e@e.com", password: "p" });

    expect(mockedJwt.sign).toHaveBeenCalledWith(expect.objectContaining({ role: "admin" }), expect.any(String), expect.any(Object));
  });

  it("login passes role into jwt payload", async () => {
    repoMock.getUserByEmail.mockResolvedValue(makeUserDoc({ role: "admin" }));
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedJwt.sign.mockReturnValue("jwt" as never);

    await service.login({ email: "x", password: "ok" });

    expect(mockedJwt.sign).toHaveBeenCalledWith(expect.objectContaining({ role: "admin" }), expect.any(String), expect.any(Object));
  });
});
