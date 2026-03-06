import bcryptjs from "bcryptjs";
import { HttpError } from "../src/errors/http-error";

jest.mock("bcryptjs");

var repoMock = {
  getUserByEmail: jest.fn(),
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
  getAllUsers: jest.fn(),
  getAdminUsers: jest.fn(),
  getUsersPaginated: jest.fn(),
  getUserById: jest.fn(),
  deleteUser: jest.fn(),
  updateUser: jest.fn(),
};

jest.mock("../src/infrastructure/repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => repoMock),
}));

const { AdminUserService } = require("../src/services/admin/user.service");
const mockedBcrypt = bcryptjs as jest.Mocked<typeof bcryptjs>;

const makeUser = (overrides: Record<string, any> = {}) => ({
  _id: "u1",
  firstName: "Test",
  lastName: "User",
  username: "testuser",
  email: "test@example.com",
  password: "hashed",
  role: "user",
  ...overrides,
});

describe("AdminUserService unit", () => {
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminUserService();
  });

  it("createUser throws when email already exists", async () => {
    repoMock.getUserByEmail.mockResolvedValue(makeUser());
    await expect(service.createUser({ email: "x@x.com" })).rejects.toBeInstanceOf(HttpError);
  });

  it("createUser throws when username already exists", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(makeUser());
    await expect(service.createUser({ email: "x@x.com", username: "taken" })).rejects.toBeInstanceOf(HttpError);
  });

  it("createUser hashes password and persists user", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("hashed-new" as never);
    repoMock.createUser.mockResolvedValue(makeUser({ password: "hashed-new" }));

    const payload: any = { email: "x@x.com", username: "u1", password: "plain" };
    const result = await service.createUser(payload);

    expect(mockedBcrypt.hash).toHaveBeenCalledWith("plain", 10);
    expect(result.password).toBe("hashed-new");
  });

  it("getAllUsers returns list", async () => {
    repoMock.getAllUsers.mockResolvedValue([makeUser(), makeUser({ _id: "u2" })]);
    const users = await service.getAllUsers();
    expect(users).toHaveLength(2);
  });

  it("getAdminUsers returns admins", async () => {
    repoMock.getAdminUsers.mockResolvedValue([makeUser({ role: "admin" })]);
    const admins = await service.getAdminUsers();
    expect(admins[0].role).toBe("admin");
  });

  it("getUsersPaginated forwards args", async () => {
    const paging = { users: [makeUser()], total: 1, totalPages: 1, currentPage: 2 };
    repoMock.getUsersPaginated.mockResolvedValue(paging);
    const result = await service.getUsersPaginated({ page: 2, limit: 10 });
    expect(repoMock.getUsersPaginated).toHaveBeenCalledWith(2, 10);
    expect(result).toEqual(paging);
  });

  it("deleteUser throws when user missing", async () => {
    repoMock.getUserById.mockResolvedValue(null);
    await expect(service.deleteUser("missing")).rejects.toBeInstanceOf(HttpError);
  });

  it("deleteUser calls repository delete for existing user", async () => {
    repoMock.getUserById.mockResolvedValue(makeUser());
    repoMock.deleteUser.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
    const result = await service.deleteUser("u1");
    expect(result.deletedCount).toBe(1);
  });

  it("updateUser throws when user does not exist", async () => {
    repoMock.getUserById.mockResolvedValue(null);
    await expect(service.updateUser("u1", { firstName: "x" })).rejects.toBeInstanceOf(HttpError);
  });

  it("updateUser hashes password when provided", async () => {
    repoMock.getUserById.mockResolvedValue(makeUser());
    mockedBcrypt.hash.mockResolvedValue("hashed-pass" as never);
    repoMock.updateUser.mockResolvedValue(makeUser({ password: "hashed-pass" }));

    await service.updateUser("u1", { password: "secret" });

    expect(mockedBcrypt.hash).toHaveBeenCalledWith("secret", 10);
    expect(repoMock.updateUser).toHaveBeenCalledWith("u1", expect.objectContaining({ password: "hashed-pass" }));
  });

  it("updateUser forwards plain field update", async () => {
    repoMock.getUserById.mockResolvedValue(makeUser());
    repoMock.updateUser.mockResolvedValue(makeUser({ firstName: "Updated" }));
    const result = await service.updateUser("u1", { firstName: "Updated" });
    expect(result.firstName).toBe("Updated");
  });

  it("getUserById throws when missing", async () => {
    repoMock.getUserById.mockResolvedValue(null);
    await expect(service.getUserById("none")).rejects.toBeInstanceOf(HttpError);
  });

  it("getUserById returns matching user", async () => {
    repoMock.getUserById.mockResolvedValue(makeUser({ _id: "u55" }));
    const user = await service.getUserById("u55");
    expect(user._id).toBe("u55");
  });

  it("createUser checks email lookup argument", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("h" as never);
    repoMock.createUser.mockResolvedValue(makeUser());
    await service.createUser({ email: "check@email.com", username: "u", password: "p" });
    expect(repoMock.getUserByEmail).toHaveBeenCalledWith("check@email.com");
  });

  it("createUser checks username lookup argument", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("h" as never);
    repoMock.createUser.mockResolvedValue(makeUser());
    await service.createUser({ email: "x@email.com", username: "check-username", password: "p" });
    expect(repoMock.getUserByUsername).toHaveBeenCalledWith("check-username");
  });

  it("createUser mutates password to hash", async () => {
    repoMock.getUserByEmail.mockResolvedValue(null);
    repoMock.getUserByUsername.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("HASHED" as never);
    repoMock.createUser.mockResolvedValue(makeUser({ password: "HASHED" }));

    const payload: any = { email: "a@a.com", username: "a", password: "plain" };
    await service.createUser(payload);

    expect(payload.password).toBe("HASHED");
  });

  it("getAllUsers can return empty array", async () => {
    repoMock.getAllUsers.mockResolvedValue([]);
    const users = await service.getAllUsers();
    expect(users).toEqual([]);
  });

  it("getAdminUsers can return empty array", async () => {
    repoMock.getAdminUsers.mockResolvedValue([]);
    const admins = await service.getAdminUsers();
    expect(admins).toEqual([]);
  });

  it("deleteUser forwards id to repository", async () => {
    repoMock.getUserById.mockResolvedValue(makeUser());
    repoMock.deleteUser.mockResolvedValue(true);
    await service.deleteUser("forward-id");
    expect(repoMock.deleteUser).toHaveBeenCalledWith("forward-id");
  });

  it("updateUser allows role change", async () => {
    repoMock.getUserById.mockResolvedValue(makeUser());
    repoMock.updateUser.mockResolvedValue(makeUser({ role: "admin" }));
    const result = await service.updateUser("u1", { role: "admin" });
    expect(result.role).toBe("admin");
  });

  it("getUsersPaginated returns repository object unchanged", async () => {
    const paging = { users: [makeUser()], total: 10, totalPages: 5, currentPage: 1 };
    repoMock.getUsersPaginated.mockResolvedValue(paging);
    const result = await service.getUsersPaginated({ page: 1, limit: 2 });
    expect(result).toEqual(paging);
  });
});
