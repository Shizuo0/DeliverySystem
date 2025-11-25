const bcrypt = require('bcryptjs');
const restauranteRepository = require('../repositories/restauranteRepository');
const enderecoRestauranteRepository = require('../repositories/enderecoRestauranteRepository');
const Restaurante = require('../models/Restaurante');
const EnderecoRestaurante = require('../models/EnderecoRestaurante');

class RestauranteService {
  // Obter dados do restaurante por ID (público ou autenticado)
  async getById(restauranteId) {
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }
    return new Restaurante(restaurante);
  }

  // Obter dados do restaurante (alias para compatibilidade)
  async getRestaurante(restauranteId) {
    return this.getById(restauranteId);
  }

  // Obter restaurante com endereço
  async getRestauranteCompleto(restauranteId) {
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }

    const endereco = await enderecoRestauranteRepository.findByRestauranteId(restauranteId);

    return {
      restaurante: new Restaurante(restaurante),
      endereco: endereco ? new EnderecoRestaurante(endereco) : null
    };
  }

  // Atualizar restaurante
  async update(restauranteId, updateData) {
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }

    // Se está atualizando email, verificar se já existe
    if (updateData.email_admin && updateData.email_admin !== restaurante.email_admin) {
      const emailExists = await restauranteRepository.emailExists(updateData.email_admin, restauranteId);
      if (emailExists) {
        throw new Error('Email já está em uso');
      }
    }

    // Se está atualizando username, verificar se já existe
    if (updateData.username && updateData.username !== restaurante.username) {
      const usernameExists = await restauranteRepository.usernameExists(updateData.username, restauranteId);
      if (usernameExists) {
        throw new Error('Username já está em uso');
      }
    }

    // Se está atualizando senha, fazer hash
    if (updateData.senha_admin) {
      const salt = await bcrypt.genSalt(10);
      updateData.senha_admin = await bcrypt.hash(updateData.senha_admin, salt);
    }

    // Remover campos que não podem ser editados
    delete updateData.nome;
    delete updateData.cnpj;

    // Atualizar restaurante
    const updated = await restauranteRepository.update(restauranteId, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar restaurante');
    }

    // Retornar restaurante atualizado
    const restauranteAtualizado = await restauranteRepository.findById(restauranteId);
    return new Restaurante(restauranteAtualizado);
  }

  // Deletar restaurante
  async delete(restauranteId) {
    const deleted = await restauranteRepository.delete(restauranteId);
    if (!deleted) {
      throw new Error('Erro ao deletar restaurante');
    }
    return true;
  }

  // Listar todos os restaurantes
  async getAll() {
    const restaurantes = await restauranteRepository.findAll();
    return restaurantes.map(r => new Restaurante(r));
  }

  // Alias para compatibilidade
  async listAll() {
    return this.getAll();
  }

  // Listar restaurantes abertos
  async getOpen() {
    const restaurantes = await restauranteRepository.findOpen();
    return restaurantes.map(r => new Restaurante(r));
  }

  // Alias para compatibilidade
  async listOpen() {
    return this.getOpen();
  }

  // Atualizar status operacional
  async updateStatus(restauranteId, status) {
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }

    if (!['Aberto', 'Fechado'].includes(status)) {
      throw new Error('Status inválido. Use "Aberto" ou "Fechado"');
    }

    const updated = await restauranteRepository.updateStatus(restauranteId, status);
    if (!updated) {
      throw new Error('Erro ao atualizar status');
    }

    const restauranteAtualizado = await restauranteRepository.findById(restauranteId);
    return new Restaurante(restauranteAtualizado);
  }

  // Alterar senha
  async changePassword(restauranteId, senhaAtual, novaSenha) {
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(senhaAtual, restaurante.senha_admin);
    if (!isValidPassword) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(novaSenha, salt);

    // Atualizar senha
    const updated = await restauranteRepository.update(restauranteId, { senha_admin: hashedPassword });
    if (!updated) {
      throw new Error('Erro ao alterar senha');
    }

    return true;
  }
}

module.exports = new RestauranteService();
