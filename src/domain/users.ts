import { z } from "zod";
import { createHash } from "crypto";
import { newId } from "../utils/id";

export const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(100),
});

export type UserInput = z.infer<typeof UserSchema>;

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
}

export class UserError extends Error {}

export class UserDirectory {
  private byId = new Map<string, User>();
  private byEmail = new Map<string, string>();

  private hash(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }

  register(input: UserInput): User {
    const parsed = UserSchema.parse(input);
    const normalizedEmail = parsed.email.toLowerCase();
    if (this.byEmail.has(normalizedEmail)) {
      throw new UserError(`email already registered: ${normalizedEmail}`);
    }
    const user: User = {
      id: newId("user"),
      email: normalizedEmail,
      passwordHash: this.hash(parsed.password),
      displayName: parsed.displayName,
      createdAt: new Date(),
    };
    this.byId.set(user.id, user);
    this.byEmail.set(normalizedEmail, user.id);
    return user;
  }

  authenticate(email: string, password: string): User {
    const id = this.byEmail.get(email.toLowerCase());
    const user = id ? this.byId.get(id) : undefined;
    if (!user || user.passwordHash !== this.hash(password)) {
      throw new UserError("invalid credentials");
    }
    return user;
  }

  get(id: string): User | undefined {
    return this.byId.get(id);
  }

  count(): number {
    return this.byId.size;
  }
}
