import { GiftCardService, GiftCardError } from "../src/domain/giftcards";

describe("GiftCardService", () => {
  let service: GiftCardService;

  beforeEach(() => {
    service = new GiftCardService();
  });

  test("issues a gift card with correct balance", () => {
    const card = service.issue(50);
    expect(card.balanceCents).toBe(5000);
  });

  test("rejects issuing non-positive balance", () => {
    expect(() => service.issue(0)).toThrow(GiftCardError);
  });

  test("redeems partial balance", () => {
    const card = service.issue(50);
    service.redeem(card.code, 2000);
    expect(service.balance(card.code)).toBe(3000);
  });

  test("rejects redeeming more than balance", () => {
    const card = service.issue(10);
    expect(() => service.redeem(card.code, 2000)).toThrow(GiftCardError);
  });

  test("rejects unknown gift card code", () => {
    expect(() => service.balance("NOPE1234")).toThrow(GiftCardError);
  });
});
