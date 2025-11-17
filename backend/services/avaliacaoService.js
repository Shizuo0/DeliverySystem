const avaliacaoRepository = require('../repositories/avaliacaoRepository');
const pedidoRepository = require('../repositories/pedidoRepository');
const Avaliacao = require('../models/Avaliacao');

class AvaliacaoService {
  // Criar avaliação (após entrega)
  async create(clienteId, avaliacaoData) {
    const { id_pedido, nota, comentario } = avaliacaoData;

    // Verificar se pedido existe
    const pedido = await pedidoRepository.findById(id_pedido);
    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    // Verificar se pedido pertence ao cliente
    if (pedido.id_cliente !== clienteId) {
      throw new Error('Este pedido não pertence a você');
    }

    // Verificar se pedido foi entregue
    if (pedido.status !== 'Entregue') {
      throw new Error('Apenas pedidos entregues podem ser avaliados');
    }

    // Verificar se pedido já foi avaliado
    const jaAvaliado = await avaliacaoRepository.pedidoJaAvaliado(id_pedido);
    if (jaAvaliado) {
      throw new Error('Este pedido já foi avaliado');
    }

    // Validar nota
    if (nota < 1 || nota > 5) {
      throw new Error('Nota deve ser entre 1 e 5');
    }

    // Criar avaliação
    const id = await avaliacaoRepository.create({
      id_pedido,
      id_cliente: clienteId,
      id_restaurante: pedido.id_restaurante,
      nota,
      comentario: comentario || null
    });

    return this.getById(id);
  }

  // Obter avaliação por ID
  async getById(id) {
    const avaliacao = await avaliacaoRepository.findById(id);
    if (!avaliacao) {
      throw new Error('Avaliação não encontrada');
    }
    return new Avaliacao(avaliacao);
  }

  // Obter avaliação por pedido
  async getByPedido(pedidoId) {
    const avaliacao = await avaliacaoRepository.findByPedidoId(pedidoId);
    if (!avaliacao) {
      throw new Error('Avaliação não encontrada');
    }
    return new Avaliacao(avaliacao);
  }

  // Listar avaliações do restaurante (feedback)
  async getByRestaurante(restauranteId) {
    const avaliacoes = await avaliacaoRepository.findByRestauranteId(restauranteId);
    return avaliacoes.map(a => new Avaliacao(a));
  }

  // Obter média de avaliações do restaurante
  async getRestauranteMedia(restauranteId) {
    const result = await avaliacaoRepository.getRestauranteMedia(restauranteId);
    return {
      media: parseFloat(result.media).toFixed(2),
      total: result.total
    };
  }

  // Listar avaliações do cliente
  async getByCliente(clienteId) {
    const avaliacoes = await avaliacaoRepository.findByClienteId(clienteId);
    return avaliacoes.map(a => new Avaliacao(a));
  }

  // Atualizar avaliação (apenas o cliente que criou)
  async update(avaliacaoId, clienteId, updateData) {
    // Verificar se avaliação existe
    const avaliacao = await avaliacaoRepository.findById(avaliacaoId);
    if (!avaliacao) {
      throw new Error('Avaliação não encontrada');
    }

    // Verificar se avaliação pertence ao cliente
    if (avaliacao.id_cliente !== clienteId) {
      throw new Error('Acesso negado a esta avaliação');
    }

    // Validar nota se estiver sendo atualizada
    if (updateData.nota && (updateData.nota < 1 || updateData.nota > 5)) {
      throw new Error('Nota deve ser entre 1 e 5');
    }

    // Atualizar avaliação
    const updated = await avaliacaoRepository.update(avaliacaoId, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar avaliação');
    }

    return this.getById(avaliacaoId);
  }

  // Deletar avaliação (apenas o cliente que criou)
  async delete(avaliacaoId, clienteId) {
    // Verificar se avaliação pertence ao cliente
    const belongsToCliente = await avaliacaoRepository.belongsToCliente(avaliacaoId, clienteId);
    if (!belongsToCliente) {
      throw new Error('Avaliação não encontrada ou acesso negado');
    }

    const deleted = await avaliacaoRepository.delete(avaliacaoId);
    if (!deleted) {
      throw new Error('Erro ao deletar avaliação');
    }
    return true;
  }
}

module.exports = new AvaliacaoService();
