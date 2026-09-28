import { ReviewBoard, ReviewError } from "../src/domain/reviews";

describe("ReviewBoard", () => {
  let board: ReviewBoard;

  beforeEach(() => {
    board = new ReviewBoard();
  });

  test("submits a review", () => {
    const review = board.submit("prod_1", "user_1", 5, "great");
    expect(review.id.startsWith("review_")).toBe(true);
  });

  test("rejects out-of-range rating", () => {
    expect(() => board.submit("prod_1", "user_1", 6, "bad")).toThrow(ReviewError);
    expect(() => board.submit("prod_1", "user_1", 0, "bad")).toThrow(ReviewError);
  });

  test("computes average rating", () => {
    board.submit("prod_1", "u1", 4, "");
    board.submit("prod_1", "u2", 2, "");
    expect(board.averageRating("prod_1")).toBe(3);
  });

  test("returns 0 average for product with no reviews", () => {
    expect(board.averageRating("prod_none")).toBe(0);
  });

  test("computes rating distribution", () => {
    board.submit("prod_1", "u1", 5, "");
    board.submit("prod_1", "u2", 5, "");
    board.submit("prod_1", "u3", 3, "");
    const dist = board.ratingDistribution("prod_1");
    expect(dist[5]).toBe(2);
    expect(dist[3]).toBe(1);
  });
});
