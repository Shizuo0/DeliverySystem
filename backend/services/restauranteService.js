const bcrypt = require('bcryptjs');
const restauranteRepository = require('../repositories/restauranteRepository');
const enderecoRestauranteRepository = require('../repositories/enderecoRestauranteRepository');
const Restaurante = require('../models/Restaurante');
const EnderecoRestaurante = require('../models/EnderecoRestaurante');

class RestauranteService {
  // Obter dados do restaurante
  async getRestaurante(restauranteId) {
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }
    return new Restaurante(restaurante);
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
  async updateRestaurante(restauranteId, updateData) {
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

    // Se está atualizando senha, fazer hash
    if (updateData.senha_admin) {
      const salt = await bcrypt.genSalt(10);
      updateData.senha_admin = await bcrypt.hash(updateData.senha_admin, salt);
    }

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
  async deleteRestaurante(restauranteId) {
    const deleted = await restauranteRepository.delete(restauranteId);
    if (!deleted) {
      throw new Error('Erro ao deletar restaurante');
    }
    return true;
  }

  // Listar todos os restaurantes
  async listAll() {
    const restaurantes = await restauranteRepository.findAll();
    return restaurantes.map(r => new Restaurante(r));
  }

  // Listar restaurantes abertos
  async listOpen() {
    const restaurantes = await restauranteRepository.findOpen();
    return restaurantes.map(r => new Restaurante(r));
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
