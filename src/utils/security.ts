
// Input sanitization and validation utilities
export const sanitizeInput = (input: string): string => {
    if (!input) return '';
    
    // Remove potential XSS vectors
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };
  
  export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };
  
  export const validatePassword = (password: string): { 
    isValid: boolean; 
    errors: string[] 
  } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  export const sanitizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '';
      }
      return urlObj.toString();
    } catch {
      return '';
    }
  };
  
  // Rate limiting utility for client-side
  class RateLimiter {
    private attempts: Map<string, { count: number; resetTime: number }> = new Map();
    
    isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
      const now = Date.now();
      const record = this.attempts.get(key);
      
      if (!record || now > record.resetTime) {
        this.attempts.set(key, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (record.count >= maxAttempts) {
        return false;
      }
      
      record.count++;
      return true;
    }
    
    getRemainingTime(key: string): number {
      const record = this.attempts.get(key);
      if (!record) return 0;
      return Math.max(0, record.resetTime - Date.now());
    }
  }
  
  export const rateLimiter = new RateLimiter();
  