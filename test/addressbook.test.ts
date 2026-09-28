import { AddressBook } from "../src/domain/addressbook";

describe("AddressBook", () => {
  let book: AddressBook;

  beforeEach(() => {
    book = new AddressBook();
  });

  test("first added address becomes default", () => {
    const addr = book.add("user_1", {
      line1: "1 Main St",
      city: "Springfield",
      postalCode: "12345",
      country: "US",
    });
    expect(addr.isDefault).toBe(true);
  });

  test("rejects invalid address input", () => {
    expect(() =>
      book.add("user_1", { line1: "", city: "X", postalCode: "1", country: "USA" })
    ).toThrow();
  });

  test("explicit default reassigns default flag", () => {
    book.add("user_1", { line1: "A", city: "X", postalCode: "111", country: "US" });
    const second = book.add(
      "user_1",
      { line1: "B", city: "Y", postalCode: "222", country: "US" },
      true
    );
    expect(book.defaultAddress("user_1")?.id).toBe(second.id);
  });

  test("lists all addresses for a user", () => {
    book.add("user_1", { line1: "A", city: "X", postalCode: "111", country: "US" });
    book.add("user_1", { line1: "B", city: "Y", postalCode: "222", country: "US" });
    expect(book.list("user_1")).toHaveLength(2);
  });

  test("removes an address", () => {
    const addr = book.add("user_1", { line1: "A", city: "X", postalCode: "111", country: "US" });
    book.remove("user_1", addr.id);
    expect(book.list("user_1")).toHaveLength(0);
  });
});
