const authService = require('../services/AuthService');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

/**
 * @desc    Register a new client
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const result = await authService.register({
    name,
    email,
    password,
    phone,
    address
  });

  logger.info(`New client registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Client registered successfully',
    data: result
  });
});

/**
 * @desc    Login client
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  logger.info(`Client logged in: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * @desc    Logout client
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // For JWT, logout is handled on the client side by removing the token
  logger.info(`Client logged out: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  logout
};
