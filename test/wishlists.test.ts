import { WishlistService, WishlistError } from "../src/domain/wishlists";

describe("WishlistService", () => {
  let wishlists: WishlistService;

  beforeEach(() => {
    wishlists = new WishlistService();
  });

  test("adds and checks products", () => {
    wishlists.add("user_1", "prod_1");
    expect(wishlists.contains("user_1", "prod_1")).toBe(true);
    expect(wishlists.contains("user_1", "prod_2")).toBe(false);
  });

  test("removes a product", () => {
    wishlists.add("user_1", "prod_1");
    wishlists.remove("user_1", "prod_1");
    expect(wishlists.contains("user_1", "prod_1")).toBe(false);
  });

  test("throws when removing a product not present", () => {
    expect(() => wishlists.remove("user_1", "prod_1")).toThrow(WishlistError);
  });

  test("count reflects list size", () => {
    wishlists.add("user_1", "prod_1");
    wishlists.add("user_1", "prod_2");
    expect(wishlists.count("user_1")).toBe(2);
  });

  test("mostWishlisted ranks products by popularity", () => {
    wishlists.add("u1", "prod_1");
    wishlists.add("u2", "prod_1");
    wishlists.add("u3", "prod_2");
    const ranked = wishlists.mostWishlisted(["prod_1", "prod_2", "prod_3"]);
    expect(ranked[0].productId).toBe("prod_1");
    expect(ranked[0].count).toBe(2);
  });
});
