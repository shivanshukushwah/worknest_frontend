/**
 * Validation utilities
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Indian phone number format: 10 digits
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letters' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain lowercase letters' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain numbers' };
  }
  return { valid: true };
};

export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const validateProfileUrl = (url: string): boolean => {
  try {
    new URL(url);
    const validDomains = ['linkedin.com', 'github.com', 'portfolio'];
    return validDomains.some((domain) => url.includes(domain));
  } catch {
    return false;
  }
};

export const validateBankAccount = (account: string): boolean => {
  return /^\d{9,18}$/.test(account);
};

export const validateIFSC = (ifsc: string): boolean => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
};
