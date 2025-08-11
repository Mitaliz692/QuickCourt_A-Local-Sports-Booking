// Email validation - enhanced with comprehensive regex
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim().toLowerCase());
};

// Password validation - enhanced with special characters requirement
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  return passwordRegex.test(password);
};

// Phone number validation - international format support
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
};

// Name validation - enhanced with length limits
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// OTP validation (6 digits)
export const isValidOTP = (otp: string): boolean => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

// File validation for profile pictures
export const validateProfilePicture = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 1024 * 1024; // 1MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or JPG)',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image size should be less than 1MB',
    };
  }

  return { isValid: true };
};

// Password strength checker
export const getPasswordStrength = (password: string): { score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  if (/[@$!%*?&]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters (@$!%*?&)');
  }

  return { score, feedback };
};

// Location validation
export const isValidLocation = (location: string): boolean => {
  return location.trim().length >= 2 && location.trim().length <= 100;
};

// Price validation
export const isValidPrice = (price: number): boolean => {
  return price > 0 && price <= 10000;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Validation error messages
export const ValidationMessages = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be 8-20 characters with uppercase, lowercase, number, and special character',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_NAME: 'Name should only contain letters and spaces (2-50 characters)',
  INVALID_LOCATION: 'Location should be 2-100 characters long',
  INVALID_PRICE: 'Price should be between 1 and 10000',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_OTP: 'OTP must be 6 digits',
  ROLE_REQUIRED: 'Please select your role',
  PROFILE_PICTURE_TOO_LARGE: 'Image size should be less than 1MB',
  PROFILE_PICTURE_INVALID_TYPE: 'Please upload a valid image file (JPEG, PNG, or JPG)',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  NAME_REQUIRED: 'Full name is required',
  PHONE_REQUIRED: 'Phone number is required',
  OTP_REQUIRED: 'OTP is required',
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
};

// Form validation function
export const validateForm = (data: Record<string, any>, rules: Record<string, string[]>): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];

    fieldRules.forEach((rule) => {
      if (errors[field]) return; // Skip if field already has an error

      switch (rule) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors[field] = ValidationMessages.REQUIRED_FIELD;
          }
          break;
        case 'email':
          if (value && !isValidEmail(value)) {
            errors[field] = ValidationMessages.INVALID_EMAIL;
          }
          break;
        case 'password':
          if (value && !isValidPassword(value)) {
            errors[field] = ValidationMessages.INVALID_PASSWORD;
          }
          break;
        case 'name':
          if (value && !isValidName(value)) {
            errors[field] = ValidationMessages.INVALID_NAME;
          }
          break;
        case 'phone':
          if (value && !isValidPhoneNumber(value)) {
            errors[field] = ValidationMessages.INVALID_PHONE;
          }
          break;
        case 'otp':
          if (value && !isValidOTP(value)) {
            errors[field] = ValidationMessages.INVALID_OTP;
          }
          break;
        default:
          break;
      }
    });
  });

  return errors;
};

// Form validation schema types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

// Generic validation function
export const validateField = (
  value: any,
  rules: ValidationRule[]
): { isValid: boolean; message?: string } => {
  for (const rule of rules) {
    if (rule.required && (!value || value.toString().trim() === '')) {
      return { isValid: false, message: rule.message || ValidationMessages.REQUIRED_FIELD };
    }

    if (value && rule.minLength && value.toString().length < rule.minLength) {
      return { isValid: false, message: rule.message || `Minimum length is ${rule.minLength}` };
    }

    if (value && rule.maxLength && value.toString().length > rule.maxLength) {
      return { isValid: false, message: rule.message || `Maximum length is ${rule.maxLength}` };
    }

    if (value && rule.pattern && !rule.pattern.test(value.toString())) {
      return { isValid: false, message: rule.message || 'Invalid format' };
    }

    if (value && rule.custom && !rule.custom(value)) {
      return { isValid: false, message: rule.message || 'Invalid value' };
    }
  }

  return { isValid: true };
};

// Common validation schemas
export const commonValidationSchemas = {
  email: [
    { required: true, message: ValidationMessages.REQUIRED_FIELD },
    { custom: isValidEmail, message: ValidationMessages.INVALID_EMAIL },
  ],
  password: [
    { required: true, message: ValidationMessages.REQUIRED_FIELD },
    { custom: isValidPassword, message: ValidationMessages.INVALID_PASSWORD },
  ],
  name: [
    { required: true, message: ValidationMessages.REQUIRED_FIELD },
    { custom: isValidName, message: ValidationMessages.INVALID_NAME },
  ],
  phone: [
    { required: true, message: ValidationMessages.REQUIRED_FIELD },
    { custom: isValidPhoneNumber, message: ValidationMessages.INVALID_PHONE },
  ],
};
