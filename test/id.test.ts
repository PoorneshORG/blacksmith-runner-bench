import { newId, isValidId } from "../src/utils/id";

describe("id utils", () => {
  test("newId prefixes a uuid", () => {
    const id = newId("user");
    expect(id.startsWith("user_")).toBe(true);
  });

  test("isValidId validates generated ids", () => {
    const id = newId("order");
    expect(isValidId(id, "order")).toBe(true);
    expect(isValidId(id, "user")).toBe(false);
    expect(isValidId("garbage", "order")).toBe(false);
  });

  test("newId produces unique values", () => {
    const ids = new Set(Array.from({ length: 50 }, () => newId("x")));
    expect(ids.size).toBe(50);
  });
});
