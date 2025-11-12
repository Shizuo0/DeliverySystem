/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate phone number (Brazilian format)
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[0-9])[0-9]{3}\-?[0-9]{4}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone
};
