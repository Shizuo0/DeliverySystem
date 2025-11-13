const enderecoClienteRepository = require('../repositories/enderecoClienteRepository');
const EnderecoCliente = require('../models/EnderecoCliente');

class EnderecoClienteService {
  // Criar novo endereço
  async create(clienteId, enderecoData) {
    const id = await enderecoClienteRepository.create({
      id_cliente: clienteId,
      ...enderecoData
    });

    const endereco = await enderecoClienteRepository.findById(id);
    return new EnderecoCliente(endereco);
  }

  // Listar endereços do cliente
  async listByCliente(clienteId) {
    const enderecos = await enderecoClienteRepository.findByClienteId(clienteId);
    return enderecos.map(e => new EnderecoCliente(e));
  }

  // Obter endereço por ID
  async getById(enderecoId, clienteId) {
    const endereco = await enderecoClienteRepository.findById(enderecoId);
    if (!endereco) {
      throw new Error('Endereço não encontrado');
    }

    // Verificar se endereço pertence ao cliente
    if (endereco.id_cliente !== clienteId) {
      throw new Error('Acesso negado a este endereço');
    }

    return new EnderecoCliente(endereco);
  }

  // Atualizar endereço
  async update(enderecoId, clienteId, enderecoData) {
    // Verificar se endereço existe e pertence ao cliente
    const belongsToCliente = await enderecoClienteRepository.belongsToCliente(enderecoId, clienteId);
    if (!belongsToCliente) {
      throw new Error('Endereço não encontrado ou acesso negado');
    }

    const updated = await enderecoClienteRepository.update(enderecoId, enderecoData);
    if (!updated) {
      throw new Error('Erro ao atualizar endereço');
    }

    const endereco = await enderecoClienteRepository.findById(enderecoId);
    return new EnderecoCliente(endereco);
  }

  // Deletar endereço
  async delete(enderecoId, clienteId) {
    // Verificar se endereço existe e pertence ao cliente
    const belongsToCliente = await enderecoClienteRepository.belongsToCliente(enderecoId, clienteId);
    if (!belongsToCliente) {
      throw new Error('Endereço não encontrado ou acesso negado');
    }

    const deleted = await enderecoClienteRepository.delete(enderecoId);
    if (!deleted) {
      throw new Error('Erro ao deletar endereço');
    }

    return true;
  }
}

module.exports = new EnderecoClienteService();
