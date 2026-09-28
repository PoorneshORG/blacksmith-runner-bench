import { v4 as uuidv4 } from "uuid";

export function newId(prefix: string): string {
  return `${prefix}_${uuidv4()}`;
}

export function isValidId(id: string, prefix: string): boolean {
  const pattern = new RegExp(
    `^${prefix}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`
  );
  return pattern.test(id);
}
