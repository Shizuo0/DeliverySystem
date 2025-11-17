const authService = require('../../services/authService');
const clienteRepository = require('../../repositories/clienteRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dos repositórios
jest.mock('../../repositories/clienteRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve registrar um novo cliente com sucesso', async () => {
      const clienteData = {
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'senha123',
        telefone: '(85) 98765-4321'
      };

      clienteRepository.emailExists.mockResolvedValue(false);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      clienteRepository.create.mockResolvedValue(1);
      clienteRepository.findById.mockResolvedValue({
        id_cliente: 1,
        ...clienteData,
        senha: 'hashedPassword'
      });
      jwt.sign.mockReturnValue('token123');

      const result = await authService.register(clienteData);

      expect(clienteRepository.emailExists).toHaveBeenCalledWith(clienteData.email);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(clienteRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('cliente');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('token123');
    });

    it('deve lançar erro se email já existe', async () => {
      const clienteData = {
        email: 'existing@example.com'
      };

      clienteRepository.emailExists.mockResolvedValue(true);

      await expect(authService.register(clienteData))
        .rejects.toThrow('Email já está em uso');
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const email = 'test@example.com';
      const senha = 'senha123';
      const cliente = {
        id_cliente: 1,
        email,
        senha: 'hashedPassword'
      };

      clienteRepository.findByEmail.mockResolvedValue(cliente);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token123');

      const result = await authService.login(email, senha);

      expect(clienteRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(senha, 'hashedPassword');
      expect(result).toHaveProperty('cliente');
      expect(result).toHaveProperty('token');
    });

    it('deve lançar erro se email não existe', async () => {
      clienteRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'senha123'))
        .rejects.toThrow('Email ou senha inválidos');
    });

    it('deve lançar erro se senha está incorreta', async () => {
      const cliente = {
        id_cliente: 1,
        email: 'test@example.com',
        senha: 'hashedPassword'
      };

      clienteRepository.findByEmail.mockResolvedValue(cliente);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Email ou senha inválidos');
    });
  });

  describe('verifyToken', () => {
    it('deve verificar token válido', () => {
      const decoded = { id: 1, email: 'test@example.com' };
      jwt.verify.mockReturnValue(decoded);

      const result = authService.verifyToken('validtoken');

      expect(jwt.verify).toHaveBeenCalled();
      expect(result).toEqual(decoded);
    });

    it('deve lançar erro para token inválido', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyToken('invalidtoken'))
        .toThrow();
    });
  });
});
