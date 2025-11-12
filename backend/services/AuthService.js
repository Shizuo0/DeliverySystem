const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('../models');
const { validateEmail, validatePassword } = require('../utils/validation');

class AuthService {
  /**
   * Register a new client
   */
  async register(data) {
    const { name, email, password, phone, address } = data;

    // Validate input
    if (!name || !email || !password) {
      throw new Error('Name, email and password are required');
    }

    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if client already exists
    const existingClient = await Client.findOne({ where: { email } });
    if (existingClient) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create client
    const client = await Client.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      address: address || null
    });

    // Generate token
    const token = this.generateToken(client);

    return {
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address
      },
      token
    };
  }

  /**
   * Login client
   */
  async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find client
    const client = await Client.findOne({ where: { email } });
    if (!client) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, client.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(client);

    return {
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address
      },
      token
    };
  }

  /**
   * Generate JWT token
   */
  generateToken(client) {
    return jwt.sign(
      {
        id: client.id,
        email: client.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );
  }
}

module.exports = new AuthService();
