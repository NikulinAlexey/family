export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

function appendClassNames(value: ClassValue, out: string[]): void {
  if (!value) return;
  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) appendClassNames(item, out);
    return;
  }
  if (typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (value[key]) out.push(key);
    }
  }
}

export function cn(...inputs: ClassValue[]) {
  const out: string[] = [];
  for (const input of inputs) appendClassNames(input, out);
  return out.join(" ");
}
