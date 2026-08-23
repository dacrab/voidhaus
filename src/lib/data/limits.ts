export const LIMITS = {
  nameMax: 200,
  subjectMax: 200,
  messageMax: 5000,
} as const;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
