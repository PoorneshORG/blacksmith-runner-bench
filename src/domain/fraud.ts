import { Cents } from "../utils/money";

export interface FraudSignal {
  orderTotalCents: Cents;
  accountAgeDays: number;
  billingShippingMismatch: boolean;
  distinctCardsUsed24h: number;
  velocityOrdersLastHour: number;
}

export interface FraudAssessment {
  score: number;
  reasons: string[];
  recommendation: "allow" | "review" | "block";
}

const HIGH_VALUE_THRESHOLD_CENTS = 50000;

export function assess(signal: FraudSignal): FraudAssessment {
  let score = 0;
  const reasons: string[] = [];

  if (signal.orderTotalCents > HIGH_VALUE_THRESHOLD_CENTS) {
    score += 20;
    reasons.push("high value order");
  }
  if (signal.accountAgeDays < 3) {
    score += 25;
    reasons.push("new account");
  }
  if (signal.billingShippingMismatch) {
    score += 20;
    reasons.push("billing/shipping mismatch");
  }
  if (signal.distinctCardsUsed24h > 2) {
    score += 25;
    reasons.push("multiple cards used recently");
  }
  if (signal.velocityOrdersLastHour > 5) {
    score += 30;
    reasons.push("high order velocity");
  }

  let recommendation: FraudAssessment["recommendation"] = "allow";
  if (score >= 70) recommendation = "block";
  else if (score >= 35) recommendation = "review";

  return { score, reasons, recommendation };
}
