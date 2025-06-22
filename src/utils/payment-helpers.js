// Utility: Generate a unique reference (UUID v4)
import { v4 as uuidv4 } from 'uuid';
export function generatePaymentRef() {
  return uuidv4();
}

// Utility: Validate payment amount
export function isValidAmount(amount) {
  return typeof amount === 'number' && amount > 0;
}

// Utility: Sanitize redirect URLs (basic)
export function sanitizeRedirectUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return '/';
  }
} 