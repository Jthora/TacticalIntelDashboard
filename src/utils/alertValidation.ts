/**
 * Alert validation utilities
 * Part of Phase 1: Critical Issues - Input Validation & Security
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface AlertFormData {
  name: string;
  keywords: string[];
  priority: string;
  [key: string]: any;
}

/**
 * Validate alert form data with comprehensive checks
 */
export function validateAlertForm(data: Partial<AlertFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate alert name
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Alert name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Alert name is too long (maximum 100 characters)';
  } else if (!/^[a-zA-Z0-9\s\-_.()]+$/.test(data.name)) {
    errors.name = 'Alert name contains invalid characters';
  }

  // Validate keywords
  if (!data.keywords || data.keywords.length === 0) {
    errors.keywords = 'At least one keyword is required';
  } else if (data.keywords.length > 20) {
    errors.keywords = 'Too many keywords (maximum 20)';
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.priority = 'Invalid priority level';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Parse keyword string into array with validation
 */
export function parseKeywords(input: string): string[] {
  if (!input || input.trim().length === 0) return [];

  // Split by multiple separators: comma, semicolon, newline, tab
  const keywords = input
    .split(/[,;\n\t]+/)
    .map(keyword => keyword.trim().toLowerCase())
    .filter(keyword => keyword.length > 0 && keyword.length <= 50) // Filter empty and overly long keywords
    .filter((keyword, index, array) => array.indexOf(keyword) === index); // Remove duplicates

  return keywords;
}

/**
 * Validate URL for webhook endpoints
 */
export function validateWebhookUrl(url: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!url) {
    return { isValid: true, errors }; // URL is optional
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS for security
    if (parsedUrl.protocol !== 'https:') {
      errors.webhook = 'Webhook URL must use HTTPS protocol';
    }

    // Block common dangerous domains/IPs
    const dangerousHosts = ['localhost', '127.0.0.1', '0.0.0.0', '10.', '192.168.', '172.'];
    if (dangerousHosts.some(host => parsedUrl.hostname.includes(host))) {
      errors.webhook = 'Webhook URL points to a restricted domain';
    }

  } catch (err) {
    errors.webhook = 'Invalid webhook URL format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!email) {
    return { isValid: true, errors }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.email = 'Invalid email address format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Comprehensive form validation combining all checks
 */
export function validateCompleteAlertForm(data: any): ValidationResult {
  const results = [
    validateAlertForm(data),
    validateWebhookUrl(data.webhook || ''),
    validateEmail(data.email || '')
  ];

  const combinedErrors = results.reduce((acc, result) => ({ ...acc, ...result.errors }), {});
  
  return {
    isValid: Object.keys(combinedErrors).length === 0,
    errors: combinedErrors
  };
}
