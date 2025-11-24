const bcrypt = require('bcryptjs');
const entregadorRepository = require('../repositories/entregadorRepository');
const Entregador = require('../models/Entregador');

class EntregadorService {
  // Criar entregador
  async create(entregadorData) {
    // Verificar se email já existe
    const emailExists = await entregadorRepository.emailExists(entregadorData.email);
    if (emailExists) {
      throw new Error('Email já está em uso');
    }

    // Verificar se telefone já existe
    const telefoneExists = await entregadorRepository.telefoneExists(entregadorData.telefone);
    if (telefoneExists) {
      throw new Error('Telefone já está em uso');
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(entregadorData.senha, salt);

    // Criar entregador
    const id = await entregadorRepository.create({
      ...entregadorData,
      senha: hashedPassword,
      status_disponibilidade: entregadorData.status_disponibilidade || 'Indisponivel'
    });

    // Buscar entregador criado
    const entregador = await entregadorRepository.findById(id);
    return new Entregador(entregador);
  }

  // Obter entregador por ID
  async getById(id) {
    const entregador = await entregadorRepository.findById(id);
    if (!entregador) {
      throw new Error('Entregador não encontrado');
    }
    return new Entregador(entregador);
  }

  // Listar todos os entregadores
  async getAll() {
    const entregadores = await entregadorRepository.findAll();
    return entregadores.map(e => new Entregador(e));
  }

  // Listar entregadores por status
  async getByStatus(status) {
    const validStatus = ['Disponivel', 'Indisponivel', 'Em Entrega'];
    if (!validStatus.includes(status)) {
      throw new Error('Status inválido');
    }

    const entregadores = await entregadorRepository.findByStatus(status);
    return entregadores.map(e => new Entregador(e));
  }

  // Listar entregadores disponiveis
  async getOnline() {
    const entregadores = await entregadorRepository.findByStatus('Disponivel');
    return entregadores.map(e => new Entregador(e));
  }

  // Atualizar entregador
  async update(id, updateData) {
    const entregador = await entregadorRepository.findById(id);
    if (!entregador) {
      throw new Error('Entregador não encontrado');
    }

    // Se está atualizando email, verificar se já existe
    if (updateData.email && updateData.email !== entregador.email) {
      const emailExists = await entregadorRepository.emailExists(updateData.email, id);
      if (emailExists) {
        throw new Error('Email já está em uso');
      }
    }

    // Se está atualizando telefone, verificar se já existe
    if (updateData.telefone && updateData.telefone !== entregador.telefone) {
      const telefoneExists = await entregadorRepository.telefoneExists(updateData.telefone, id);
      if (telefoneExists) {
        throw new Error('Telefone já está em uso');
      }
    }

    // Se está atualizando senha, fazer hash
    if (updateData.senha) {
      const salt = await bcrypt.genSalt(10);
      updateData.senha = await bcrypt.hash(updateData.senha, salt);
    }

    // Atualizar entregador
    const updated = await entregadorRepository.update(id, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar entregador');
    }

    // Retornar entregador atualizado
    const entregadorAtualizado = await entregadorRepository.findById(id);
    return new Entregador(entregadorAtualizado);
  }

  // Atualizar status de disponibilidade
  async updateStatus(id, status) {
    const validStatus = ['Disponivel', 'Indisponivel', 'Em Entrega'];
    if (!validStatus.includes(status)) {
      throw new Error('Status inválido. Use: Disponivel, Indisponivel ou Em Entrega');
    }

    const entregador = await entregadorRepository.findById(id);
    if (!entregador) {
      throw new Error('Entregador não encontrado');
    }

    const updated = await entregadorRepository.updateStatus(id, status);
    if (!updated) {
      throw new Error('Erro ao atualizar status');
    }

    const entregadorAtualizado = await entregadorRepository.findById(id);
    return new Entregador(entregadorAtualizado);
  }

  // Deletar entregador
  async delete(id) {
    const deleted = await entregadorRepository.delete(id);
    if (!deleted) {
      throw new Error('Erro ao deletar entregador');
    }
    return true;
  }
}

module.exports = new EntregadorService();
