import { newId } from "../utils/id";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export class ReviewError extends Error {}

export class ReviewBoard {
  private reviews: Review[] = [];

  submit(productId: string, userId: string, rating: number, comment: string): Review {
    if (rating < 1 || rating > 5) throw new ReviewError("rating must be between 1 and 5");
    const review: Review = {
      id: newId("review"),
      productId,
      userId,
      rating,
      comment,
      createdAt: new Date(),
    };
    this.reviews.push(review);
    return review;
  }

  forProduct(productId: string): Review[] {
    return this.reviews.filter((r) => r.productId === productId);
  }

  averageRating(productId: string): number {
    const relevant = this.forProduct(productId);
    if (relevant.length === 0) return 0;
    const total = relevant.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((total / relevant.length) * 100) / 100;
  }

  ratingDistribution(productId: string): Record<number, number> {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of this.forProduct(productId)) {
      dist[review.rating] += 1;
    }
    return dist;
  }
}
