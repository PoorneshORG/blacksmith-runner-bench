import { UserDirectory, UserError } from "../src/domain/users";

describe("UserDirectory", () => {
  let users: UserDirectory;

  beforeEach(() => {
    users = new UserDirectory();
  });

  test("registers a user", () => {
    const user = users.register({
      email: "Alice@Example.com",
      password: "supersecret",
      displayName: "Alice",
    });
    expect(user.email).toBe("alice@example.com");
    expect(user.id.startsWith("user_")).toBe(true);
  });

  test("rejects duplicate email", () => {
    users.register({ email: "a@b.com", password: "supersecret", displayName: "A" });
    expect(() =>
      users.register({ email: "A@B.com", password: "supersecret", displayName: "A2" })
    ).toThrow(UserError);
  });

  test("rejects invalid email", () => {
    expect(() =>
      users.register({ email: "not-an-email", password: "supersecret", displayName: "A" })
    ).toThrow();
  });

  test("authenticates with correct password", () => {
    users.register({ email: "a@b.com", password: "supersecret", displayName: "A" });
    const user = users.authenticate("a@b.com", "supersecret");
    expect(user.email).toBe("a@b.com");
  });

  test("rejects wrong password", () => {
    users.register({ email: "a@b.com", password: "supersecret", displayName: "A" });
    expect(() => users.authenticate("a@b.com", "wrongpass")).toThrow(UserError);
  });

  test("count tracks registered users", () => {
    expect(users.count()).toBe(0);
    users.register({ email: "a@b.com", password: "supersecret", displayName: "A" });
    expect(users.count()).toBe(1);
  });
});
