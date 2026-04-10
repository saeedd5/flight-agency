/**
 * Input validation and sanitization utilities
 */

/**
 * Validate airport code (must be exactly 3 uppercase letters)
 */
export function validateAirportCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Airport code is required' };
  }
  
  const trimmed = code.trim().toUpperCase();
  
  if (trimmed.length !== 3) {
    return { valid: false, error: 'Airport code must be exactly 3 letters' };
  }
  
  if (!/^[A-Z]{3}$/.test(trimmed)) {
    return { valid: false, error: 'Airport code must contain only letters' };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate date (must be valid date and not in the past)
 */
export function validateDate(date, allowPast = false) {
  if (!date) {
    return { valid: false, error: 'Date is required' };
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
      return { valid: false, error: 'Date cannot be in the past' };
    }
  }
  
  return { valid: true, value: dateObj };
}

/**
 * Validate email address
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const trimmed = email.trim();
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email address' };
  }
  
  if (trimmed.length > 254) {
    return { valid: false, error: 'Email address is too long' };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  
  const trimmed = phone.trim();
  
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  
  if (!phoneRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid phone number format' };
  }
  
  // Must have at least 7 digits
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return { valid: false, error: 'Phone number must have at least 7 digits' };
  }
  
  if (digitsOnly.length > 15) {
    return { valid: false, error: 'Phone number is too long' };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate name (first name or last name)
 */
export function validateName(name, fieldName = 'Name') {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: `${fieldName} is too long (max 50 characters)` };
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\u0600-\u06FF\s\-']+$/;
  
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Sanitize string input (remove potentially dangerous characters)
 */
export function sanitizeString(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validate passenger count
 */
export function validatePassengerCount(count, fieldName = 'Passenger count') {
  const num = typeof count === 'string' ? parseInt(count, 10) : count;
  
  if (isNaN(num) || num < 0) {
    return { valid: false, error: `${fieldName} must be a positive number` };
  }
  
  if (num > 9) {
    return { valid: false, error: `${fieldName} cannot exceed 9` };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate search form data
 */
export function validateSearchForm(data) {
  const errors = {};
  
  // Validate origin
  const originValidation = validateAirportCode(data.from);
  if (!originValidation.valid) {
    errors.from = originValidation.error;
  }
  
  // Validate destination
  const destinationValidation = validateAirportCode(data.to);
  if (!destinationValidation.valid) {
    errors.to = destinationValidation.error;
  }
  
  // Check if origin and destination are the same
  if (originValidation.valid && destinationValidation.valid) {
    if (originValidation.value === destinationValidation.value) {
      errors.to = 'Origin and destination cannot be the same';
    }
  }
  
  // Validate departure date
  const departureValidation = validateDate(data.departure);
  if (!departureValidation.valid) {
    errors.departure = departureValidation.error;
  }
  
  // Validate return date (if provided)
  if (data.return) {
    const returnValidation = validateDate(data.return);
    if (!returnValidation.valid) {
      errors.return = returnValidation.error;
    } else if (departureValidation.valid) {
      // Check if return date is after departure date
      if (returnValidation.value < departureValidation.value) {
        errors.return = 'Return date must be after departure date';
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      from: originValidation.valid ? originValidation.value : data.from,
      to: destinationValidation.valid ? destinationValidation.value : data.to,
      departure: departureValidation.valid ? departureValidation.value : data.departure,
      return: data.return || null
    }
  };
}

/**
 * Validate booking form data
 */
export function validateBookingForm(data) {
  const errors = {};
  
  // Validate first name
  const firstNameValidation = validateName(data.firstName, 'First name');
  if (!firstNameValidation.valid) {
    errors.firstName = firstNameValidation.error;
  }
  
  // Validate last name
  const lastNameValidation = validateName(data.lastName, 'Last name');
  if (!lastNameValidation.valid) {
    errors.lastName = lastNameValidation.error;
  }
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }
  
  // Validate phone
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.valid) {
    errors.phone = phoneValidation.error;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      firstName: firstNameValidation.valid ? firstNameValidation.value : sanitizeString(data.firstName),
      lastName: lastNameValidation.valid ? lastNameValidation.value : sanitizeString(data.lastName),
      email: emailValidation.valid ? emailValidation.value : sanitizeString(data.email),
      phone: phoneValidation.valid ? phoneValidation.value : sanitizeString(data.phone),
      passport: data.passport ? sanitizeString(data.passport) : null
    }
  };
}
