export const LIMITS = {
  nameMax: 200,
  emailMax: 254,
  messageMax: 5000,
} as const;

export function isValidEmail(email: string): boolean {
  return email.length <= LIMITS.emailMax && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
