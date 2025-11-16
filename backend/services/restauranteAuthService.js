const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const restauranteRepository = require('../repositories/restauranteRepository');
const Restaurante = require('../models/Restaurante');

class RestauranteAuthService {
  // Registrar novo restaurante
  async register(restauranteData) {
    // Verificar se email já existe
    const emailExists = await restauranteRepository.emailExists(restauranteData.email_admin);
    if (emailExists) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(restauranteData.senha_admin, salt);

    // Criar restaurante
    const id = await restauranteRepository.create({
      ...restauranteData,
      senha_admin: hashedPassword
    });

    // Buscar restaurante criado
    const restaurante = await restauranteRepository.findById(id);
    
    // Gerar token
    const token = this.generateToken(restaurante);

    return {
      restaurante: new Restaurante(restaurante),
      token
    };
  }

  // Login
  async login(email, senha) {
    // Buscar restaurante
    const restaurante = await restauranteRepository.findByEmail(email);
    if (!restaurante) {
      throw new Error('Email ou senha inválidos');
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, restaurante.senha_admin);
    if (!isValidPassword) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar token
    const token = this.generateToken(restaurante);

    return {
      restaurante: new Restaurante(restaurante),
      token
    };
  }

  // Gerar JWT token
  generateToken(restaurante) {
    return jwt.sign(
      { 
        id: restaurante.id_restaurante, 
        email: restaurante.email_admin,
        tipo: 'restaurante'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  // Verificar token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

module.exports = new RestauranteAuthService();
