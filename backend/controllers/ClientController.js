const clientService = require('../services/ClientService');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get client profile
 * @route   GET /api/clients/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const client = await clientService.getProfile(req.user.id);

  logger.info(`Profile retrieved for client: ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: client
  });
});

/**
 * @desc    Update client profile
 * @route   PUT /api/clients/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, address, currentPassword, newPassword } = req.body;

  const updatedClient = await clientService.updateProfile(req.user.id, {
    name,
    email,
    phone,
    address,
    currentPassword,
    newPassword
  });

  logger.info(`Profile updated for client: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedClient
  });
});

/**
 * @desc    Delete client account
 * @route   DELETE /api/clients/profile
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required to delete account'
    });
  }

  await clientService.deleteAccount(req.user.id, password);

  logger.info(`Account deleted for client: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
