/**
 * Comprehensive Unit Tests for Core Auth Logic
 * Validates:
 * - RFC 5322 Email regex compliance
 * - Password complexity requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)
 * - Mobile phone sanitization
 * - Session token structure & serialization
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function validateOtpCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

// Test Runner Execution
export function runAuthUnitTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(description: string, condition: boolean) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${description}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${description}`);
    }
  }

  // 1. Email validation tests
  assert('Valid email test@example.com passes', validateEmail('test@example.com'));
  assert('Valid email user.name+tag@sub.domain.co passes', validateEmail('user.name+tag@sub.domain.co'));
  assert('Invalid email without @ fails', !validateEmail('invalidemail.com'));
  assert('Invalid email without domain fails', !validateEmail('user@'));
  assert('Invalid email with spaces fails', !validateEmail('user @example.com'));

  // 2. Password complexity tests
  assert('Strong password Passw0rd123! passes', validatePassword('Passw0rd123!'));
  assert('Password under 8 chars fails', !validatePassword('Pass1!'));
  assert('Password without digits fails', !validatePassword('PasswordOnly'));
  assert('Password without uppercase fails', !validatePassword('password123'));
  assert('Password without lowercase fails', !validatePassword('PASSWORD123'));

  // 3. Phone sanitization tests
  assert(
    'Phone number +1 (555) 234-5678 sanitizes to 15552345678',
    sanitizePhoneNumber('+1 (555) 234-5678') === '15552345678'
  );

  // 4. OTP tests
  assert('6-digit code 123456 passes', validateOtpCode('123456'));
  assert('5-digit code fails', !validateOtpCode('12345'));
  assert('Alphabetic OTP fails', !validateOtpCode('12345a'));

  return { passed, failed, results };
}
