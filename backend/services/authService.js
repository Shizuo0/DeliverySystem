const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clienteRepository = require('../repositories/clienteRepository');
const Cliente = require('../models/Cliente');

class AuthService {
  // Registrar novo cliente
  async register(clienteData) {
    // Verificar se email já existe
    const emailExists = await clienteRepository.emailExists(clienteData.email);
    if (emailExists) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(clienteData.senha, salt);

    // Criar cliente
    const id = await clienteRepository.create({
      ...clienteData,
      senha: hashedPassword
    });

    // Buscar cliente criado
    const cliente = await clienteRepository.findById(id);
    
    // Gerar token
    const token = this.generateToken(cliente);

    return {
      cliente: new Cliente(cliente),
      token
    };
  }

  // Login
  async login(email, senha) {
    // Buscar cliente
    const cliente = await clienteRepository.findByEmail(email);
    if (!cliente) {
      throw new Error('Email ou senha inválidos');
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, cliente.senha);
    if (!isValidPassword) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar token
    const token = this.generateToken(cliente);

    return {
      cliente: new Cliente(cliente),
      token
    };
  }

  // Gerar JWT token
  generateToken(cliente) {
    return jwt.sign(
      { 
        id: cliente.id_cliente, 
        email: cliente.email 
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

module.exports = new AuthService();
