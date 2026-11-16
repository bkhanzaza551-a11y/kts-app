import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateOtp,
  validateSecurityCode,
  validateConfirmPassword,
} from '../src/utils/validators';

describe('Mobile Input Validators', () => {
  describe('validateEmail', () => {
    it('returns error when email is empty', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    it('returns error when email format is invalid', () => {
      expect(validateEmail('invalid-email')).toBe('Invalid email format');
    });

    it('returns null for valid email address', () => {
      expect(validateEmail('user@ktsmarkets.com')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('returns error when password is empty', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('returns error when password is under 8 characters', () => {
      expect(validatePassword('short')).toBe('Password must be at least 8 characters');
    });

    it('returns null when password is valid', () => {
      expect(validatePassword('Password123!')).toBeNull();
    });
  });

  describe('validateName', () => {
    it('validates non-empty names', () => {
      expect(validateName('')).toBe('Name is required');
      expect(validateName('A')).toBe('Name must be at least 2 characters');
      expect(validateName('Ahmed Khan')).toBeNull();
    });
  });

  describe('validateOtp', () => {
    it('requires 6 numeric digits', () => {
      expect(validateOtp('')).toBe('OTP is required');
      expect(validateOtp('123')).toBe('OTP must be 6 digits');
      expect(validateOtp('12345A')).toBe('OTP must be numbers only');
      expect(validateOtp('123456')).toBeNull();
    });
  });

  describe('validateConfirmPassword', () => {
    it('ensures password matches confirm password', () => {
      expect(validateConfirmPassword('pass1', 'pass2')).toBe('Passwords do not match');
      expect(validateConfirmPassword('Password123!', 'Password123!')).toBeNull();
    });
  });
});
