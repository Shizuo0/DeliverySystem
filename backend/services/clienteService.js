const bcrypt = require('bcryptjs');
const clienteRepository = require('../repositories/clienteRepository');
const Cliente = require('../models/Cliente');

class ClienteService {
  // Obter perfil do cliente
  async getProfile(clienteId) {
    const cliente = await clienteRepository.findById(clienteId);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }
    return new Cliente(cliente);
  }

  // Atualizar perfil do cliente
  async updateProfile(clienteId, updateData) {
    const cliente = await clienteRepository.findById(clienteId);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Se está atualizando email, verificar se já existe
    if (updateData.email && updateData.email !== cliente.email) {
      const emailExists = await clienteRepository.emailExists(updateData.email, clienteId);
      if (emailExists) {
        throw new Error('Email já está em uso');
      }
    }

    // Se está atualizando username, verificar se já existe
    if (updateData.username && updateData.username !== cliente.username) {
      const usernameExists = await clienteRepository.usernameExists(updateData.username, clienteId);
      if (usernameExists) {
        throw new Error('Username já está em uso');
      }
    }

    // Se está atualizando senha, fazer hash
    if (updateData.senha) {
      const salt = await bcrypt.genSalt(10);
      updateData.senha = await bcrypt.hash(updateData.senha, salt);
    }

    // Remover campos que não podem ser editados
    delete updateData.nome;
    delete updateData.cpf;

    // Atualizar cliente
    const updated = await clienteRepository.update(clienteId, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar perfil');
    }

    // Retornar cliente atualizado
    const clienteAtualizado = await clienteRepository.findById(clienteId);
    return new Cliente(clienteAtualizado);
  }

  // Deletar conta
  async deleteAccount(clienteId) {
    const deleted = await clienteRepository.delete(clienteId);
    if (!deleted) {
      throw new Error('Erro ao deletar conta');
    }
    return true;
  }

  // Listar todos os clientes (admin)
  async listAll() {
    const clientes = await clienteRepository.findAll();
    return clientes.map(c => new Cliente(c));
  }

  // Alterar senha
  async changePassword(clienteId, senhaAtual, novaSenha) {
    const cliente = await clienteRepository.findById(clienteId);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(senhaAtual, cliente.senha);
    if (!isValidPassword) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(novaSenha, salt);

    // Atualizar senha
    const updated = await clienteRepository.update(clienteId, { senha: hashedPassword });
    if (!updated) {
      throw new Error('Erro ao alterar senha');
    }

    return true;
  }
}

module.exports = new ClienteService();
