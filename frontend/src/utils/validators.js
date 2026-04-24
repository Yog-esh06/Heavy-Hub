/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10-15 digits, international format)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

/**
 * Validate non-empty string
 */
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

/**
 * Validate number is positive
 */
export const validatePositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate number is within range
 */
export const validateNumberRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate license number format (Indian: typically alphanumeric)
 */
export const validateLicenseNumber = (license) => {
  const licenseRegex = /^[A-Z]{2}[A-Z0-9]{8,10}$/;
  return licenseRegex.test(license.toUpperCase().replace(/\s+/g, ""));
};

/**
 * Validate Aadhar number (12 digits)
 */
export const validateAadhar = (aadhar) => {
  const aadharRegex = /^\d{12}$/;
  return aadharRegex.test(aadhar.replace(/\s/g, ""));
};

/**
 * Validate date string (YYYY-MM-DD format)
 */
export const validateDateFormat = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate time string (HH:MM format, 24-hour)
 */
export const validateTimeFormat = (timeString) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

/**
 * Get validation error message
 */
export const getValidationError = (fieldName, fieldValue, rules) => {
  for (const rule of rules) {
    const { type, params, message } = rule;

    let isValid = true;

    switch (type) {
      case "required":
        isValid = validateRequired(fieldValue);
        break;
      case "email":
        isValid = validateEmail(fieldValue);
        break;
      case "phone":
        isValid = validatePhone(fieldValue);
        break;
      case "minLength":
        isValid = validateMinLength(fieldValue, params);
        break;
      case "maxLength":
        isValid = validateMaxLength(fieldValue, params);
        break;
      case "positiveNumber":
        isValid = validatePositiveNumber(fieldValue);
        break;
      case "dateFormat":
        isValid = validateDateFormat(fieldValue);
        break;
      case "timeFormat":
        isValid = validateTimeFormat(fieldValue);
        break;
      default:
        break;
    }

    if (!isValid) {
      return message || `${fieldName} is invalid`;
    }
  }

  return null;
};