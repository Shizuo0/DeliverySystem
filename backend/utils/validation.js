const { AppError } = require('../middlewares/errorHandler');

/**
 * Validation utility functions
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  // Brazilian phone format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

const validateRequired = (fields, body) => {
  const missingFields = [];
  
  fields.forEach(field => {
    if (!body[field] || body[field].toString().trim() === '') {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
  }
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
};
