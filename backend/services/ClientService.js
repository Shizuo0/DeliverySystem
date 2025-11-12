const bcrypt = require('bcryptjs');
const { Client } = require('../models');
const { validateEmail, validatePassword, validatePhone } = require('../utils/validation');

class ClientService {
  /**
   * Get client profile by ID
   */
  async getProfile(clientId) {
    const client = await Client.findByPk(clientId, {
      attributes: { exclude: ['password'] }
    });

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  /**
   * Update client profile
   */
  async updateProfile(clientId, data) {
    const { name, email, phone, address, currentPassword, newPassword } = data;

    // Find client
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // If updating email, validate format and check if already exists
    if (email && email !== client.email) {
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const existingClient = await Client.findOne({ where: { email } });
      if (existingClient) {
        throw new Error('Email already in use');
      }
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      throw new Error('Invalid phone format');
    }

    // If updating password, validate current password and new password
    if (newPassword) {
      if (!currentPassword) {
        throw new Error('Current password is required to change password');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, client.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (!validatePassword(newPassword)) {
        throw new Error('New password must be at least 6 characters long');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      client.password = hashedPassword;
    }

    // Update fields
    if (name) client.name = name;
    if (email) client.email = email;
    if (phone !== undefined) client.phone = phone;
    if (address !== undefined) client.address = address;

    await client.save();

    // Return client without password
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    };
  }

  /**
   * Delete client account
   */
  async deleteAccount(clientId, password) {
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, client.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    await client.destroy();

    return { message: 'Account deleted successfully' };
  }
}

module.exports = new ClientService();
