export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!re.test(email)) return 'Invalid email format';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  const re = /^\+?[0-9]{10,15}$/;
  if (!re.test(phone.replace(/\s/g, ''))) return 'Invalid phone number';
  return null;
};

export const validateOtp = (otp) => {
  if (!otp) return 'OTP is required';
  if (otp.length !== 6) return 'OTP must be 6 digits';
  if (!/^\d+$/.test(otp)) return 'OTP must be numbers only';
  return null;
};

export const validateSecurityCode = (code) => {
  if (!code) return 'Security code is required';
  if (code.length < 4 || code.length > 8) return 'Security code must be 4-8 characters';
  return null;
};

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return 'Please confirm password';
  if (password !== confirm) return 'Passwords do not match';
  return null;
};
