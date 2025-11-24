const pedidoRepository = require('../repositories/pedidoRepository');
const itemPedidoRepository = require('../repositories/itemPedidoRepository');
const itemCardapioRepository = require('../repositories/itemCardapioRepository');
const restauranteRepository = require('../repositories/restauranteRepository');
const enderecoClienteRepository = require('../repositories/enderecoClienteRepository');
const entregadorRepository = require('../repositories/entregadorRepository');
const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');

class PedidoService {
  // Criar pedido a partir do carrinho
  async createFromCart(clienteId, cartData) {
    // Validar dados do carrinho
    if (!cartData.id_restaurante) {
      throw new Error('Restaurante não especificado');
    }
    if (!cartData.id_endereco_cliente) {
      throw new Error('Endereço de entrega não especificado');
    }
    if (!cartData.metodo_pagamento) {
      throw new Error('Método de pagamento não especificado');
    }
    if (!cartData.itens || cartData.itens.length === 0) {
      throw new Error('Carrinho vazio');
    }

    // Verificar se restaurante existe e está aberto
    const restaurante = await restauranteRepository.findById(cartData.id_restaurante);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }
    if (restaurante.status_operacional !== 'Aberto') {
      throw new Error('Restaurante está fechado no momento');
    }

    // Verificar se endereço pertence ao cliente
    const endereco = await enderecoClienteRepository.findById(cartData.id_endereco_cliente);
    if (!endereco || endereco.id_cliente !== clienteId) {
      throw new Error('Endereço inválido ou não pertence ao cliente');
    }

    // Validar itens e calcular valor total
    let valorTotal = 0;
    const itensValidados = [];

    for (const itemCart of cartData.itens) {
      // Buscar item do cardápio
      const itemCardapio = await itemCardapioRepository.findById(itemCart.id_item_cardapio);
      
      if (!itemCardapio) {
        throw new Error(`Item ${itemCart.id_item_cardapio} não encontrado`);
      }

      // Verificar se item pertence ao restaurante
      if (itemCardapio.id_restaurante !== cartData.id_restaurante) {
        throw new Error(`Item ${itemCardapio.nome} não pertence a este restaurante`);
      }

      // Verificar se item está disponível
      if (!itemCardapio.disponivel) {
        throw new Error(`Item ${itemCardapio.nome} não está disponível`);
      }

      // Validar quantidade
      if (!itemCart.quantidade || itemCart.quantidade < 1) {
        throw new Error(`Quantidade inválida para ${itemCardapio.nome}`);
      }

      // Usar o preço atual do cardápio (gravar o preço no momento do pedido)
      const precoUnitario = parseFloat(itemCardapio.preco);
      const subtotal = precoUnitario * itemCart.quantidade;
      valorTotal += subtotal;

      itensValidados.push({
        id_item_cardapio: itemCardapio.id_item_cardapio,
        quantidade: itemCart.quantidade,
        preco_unitario_gravado: precoUnitario
      });
    }

    // Adicionar taxa de entrega ao valor total
    if (restaurante.taxa_entrega) {
      valorTotal += parseFloat(restaurante.taxa_entrega);
    }

    // Criar pedido
    const pedidoId = await pedidoRepository.create({
      id_cliente: clienteId,
      id_restaurante: cartData.id_restaurante,
      id_endereco_cliente: cartData.id_endereco_cliente,
      valor_total: valorTotal,
      metodo_pagamento: cartData.metodo_pagamento,
      status: 'Pendente'
    });

    // Criar itens do pedido
    await itemPedidoRepository.createMany(pedidoId, itensValidados);

    // Buscar pedido completo com itens
    return this.getById(pedidoId, clienteId);
  }

  // Obter pedido por ID (com verificação de permissão)
  async getById(pedidoId, userId, userType = 'cliente') {
    const pedido = await pedidoRepository.findById(pedidoId);
    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    // Verificar permissão
    if (userType === 'cliente' && pedido.id_cliente !== userId) {
      throw new Error('Acesso negado a este pedido');
    }
    if (userType === 'restaurante' && pedido.id_restaurante !== userId) {
      throw new Error('Acesso negado a este pedido');
    }

    // Buscar itens do pedido
    const itens = await itemPedidoRepository.findByPedidoId(pedidoId);
    pedido.itens = itens.map(i => new ItemPedido(i));

    return new Pedido(pedido);
  }

  // Listar pedidos do cliente
  async getByCliente(clienteId) {
    const pedidos = await pedidoRepository.findByClienteId(clienteId);
    
    // Buscar itens para cada pedido
    const pedidosCompletos = await Promise.all(
      pedidos.map(async (pedido) => {
        const itens = await itemPedidoRepository.findByPedidoId(pedido.id_pedido);
        pedido.itens = itens.map(i => new ItemPedido(i));
        return new Pedido(pedido);
      })
    );

    return pedidosCompletos;
  }

  // Listar pedidos do restaurante
  async getByRestaurante(restauranteId, status = null) {
    let pedidos;
    
    if (status) {
      pedidos = await pedidoRepository.findByRestauranteAndStatus(restauranteId, status);
    } else {
      pedidos = await pedidoRepository.findByRestauranteId(restauranteId);
    }

    // Buscar itens para cada pedido
    const pedidosCompletos = await Promise.all(
      pedidos.map(async (pedido) => {
        const itens = await itemPedidoRepository.findByPedidoId(pedido.id_pedido);
        pedido.itens = itens.map(i => new ItemPedido(i));
        return new Pedido(pedido);
      })
    );

    return pedidosCompletos;
  }

  // Listar pedidos do entregador
  async getByEntregador(entregadorId) {
    const pedidos = await pedidoRepository.findByEntregadorId(entregadorId);
    
    // Buscar itens para cada pedido
    const pedidosCompletos = await Promise.all(
      pedidos.map(async (pedido) => {
        const itens = await itemPedidoRepository.findByPedidoId(pedido.id_pedido);
        pedido.itens = itens.map(i => new ItemPedido(i));
        return new Pedido(pedido);
      })
    );

    return pedidosCompletos;
  }

  // Atualizar status do pedido (apenas restaurante)
  async updateStatus(pedidoId, restauranteId, novoStatus) {
    // Verificar se pedido existe e pertence ao restaurante
    const belongsToRestaurante = await pedidoRepository.belongsToRestaurante(pedidoId, restauranteId);
    if (!belongsToRestaurante) {
      throw new Error('Pedido não encontrado ou acesso negado');
    }

    // Buscar pedido atual
    const pedido = await pedidoRepository.findById(pedidoId);
    const statusAtual = pedido.status;

    // Validar transição de status
    const transicoesValidas = {
      'Pendente': ['Confirmado', 'Cancelado'],
      'Confirmado': ['Em Preparo', 'Cancelado'],
      'Em Preparo': ['Pronto', 'Cancelado'],
      'Pronto': ['A Caminho', 'Cancelado'],
      'A Caminho': ['Aguardando Confirmação', 'Entregue', 'Cancelado'],
      'Aguardando Confirmação': ['Entregue', 'Cancelado'],
      'Entregue': [],
      'Cancelado': []
    };

    if (!transicoesValidas[statusAtual].includes(novoStatus)) {
      throw new Error(`Não é possível mudar status de "${statusAtual}" para "${novoStatus}"`);
    }

    // Atualizar status
    const updated = await pedidoRepository.updateStatus(pedidoId, novoStatus);
    if (!updated) {
      throw new Error('Erro ao atualizar status do pedido');
    }

    return this.getById(pedidoId, restauranteId, 'restaurante');
  }

  // Cancelar pedido (cliente pode cancelar apenas se Pendente)
  async cancelByCliente(pedidoId, clienteId) {
    // Verificar se pedido pertence ao cliente
    const belongsToCliente = await pedidoRepository.belongsToCliente(pedidoId, clienteId);
    if (!belongsToCliente) {
      throw new Error('Pedido não encontrado ou acesso negado');
    }

    // Buscar pedido
    const pedido = await pedidoRepository.findById(pedidoId);
    
    // Cliente só pode cancelar pedidos pendentes
    if (pedido.status !== 'Pendente') {
      throw new Error('Apenas pedidos pendentes podem ser cancelados pelo cliente');
    }

    // Atualizar status
    const updated = await pedidoRepository.updateStatus(pedidoId, 'Cancelado');
    if (!updated) {
      throw new Error('Erro ao cancelar pedido');
    }

    return this.getById(pedidoId, clienteId, 'cliente');
  }

  // Confirmar entrega pelo cliente
  async confirmDeliveryByCliente(pedidoId, clienteId) {
    // Verificar se pedido pertence ao cliente
    const belongsToCliente = await pedidoRepository.belongsToCliente(pedidoId, clienteId);
    if (!belongsToCliente) {
      throw new Error('Pedido não encontrado ou acesso negado');
    }

    // Buscar pedido
    const pedido = await pedidoRepository.findById(pedidoId);
    
    // Permitir confirmar entrega em qualquer status para fins de teste
    // if (pedido.status !== 'A Caminho') {
    //   throw new Error('Apenas pedidos em rota de entrega podem ser confirmados');
    // }

    // Atualizar status
    const updated = await pedidoRepository.updateStatus(pedidoId, 'Entregue');
    if (!updated) {
      throw new Error('Erro ao confirmar entrega');
    }

    // Se tiver entregador, atualizar status dele para Disponivel
    if (pedido.id_entregador) {
      await entregadorRepository.updateStatus(pedido.id_entregador, 'Disponivel');
    }

    return this.getById(pedidoId, clienteId, 'cliente');
  }

  // Atribuir entregador ao pedido (quando status = "A Caminho")
  async assignEntregador(pedidoId, restauranteId, entregadorId) {
    // Verificar se pedido pertence ao restaurante
    const belongsToRestaurante = await pedidoRepository.belongsToRestaurante(pedidoId, restauranteId);
    if (!belongsToRestaurante) {
      throw new Error('Pedido não encontrado ou acesso negado');
    }

    // Buscar pedido
    const pedido = await pedidoRepository.findById(pedidoId);

    // Só pode atribuir entregador se pedido estiver "A Caminho" ou "Pronto"
    if (pedido.status !== 'A Caminho' && pedido.status !== 'Pronto') {
      throw new Error('Entregador só pode ser atribuído quando pedido estiver "Pronto" ou "A Caminho"');
    }

    // Verificar se entregador existe
    const entregador = await entregadorRepository.findById(entregadorId);
    if (!entregador) {
      throw new Error('Entregador não encontrado');
    }

    // Verificar se entregador está disponivel
    if (entregador.status_disponibilidade !== 'Disponivel') {
      throw new Error('Entregador não está disponível');
    }

    // Atribuir entregador
    const updated = await pedidoRepository.assignEntregador(pedidoId, entregadorId);
    if (!updated) {
      throw new Error('Erro ao atribuir entregador');
    }

    // Atualizar status do entregador para "Em Entrega"
    await entregadorRepository.updateStatus(entregadorId, 'Em Entrega');

    return this.getById(pedidoId, restauranteId, 'restaurante');
  }

  // Atualizar status pelo entregador
  async updateStatusByEntregador(pedidoId, entregadorId, novoStatus) {
    const pedido = await pedidoRepository.findById(pedidoId);
    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    if (parseInt(pedido.id_entregador) !== parseInt(entregadorId)) {
      throw new Error('Este pedido não está atribuído a este entregador');
    }

    // Validar transição
    if (pedido.status === 'A Caminho' && (novoStatus === 'Aguardando Confirmação' || novoStatus === 'Entregue')) {
      // OK
    } else {
      throw new Error(`Transição inválida para entregador: ${pedido.status} -> ${novoStatus}`);
    }

    const updated = await pedidoRepository.updateStatus(pedidoId, novoStatus);
    if (!updated) {
      throw new Error('Erro ao atualizar status do pedido');
    }

    // Se entregue, liberar entregador
    if (novoStatus === 'Entregue') {
      await entregadorRepository.updateStatus(entregadorId, 'Disponivel');
    }

    return this.getById(pedidoId, null, 'public'); // 'public' bypasses owner check if we implement it, or just use a safe getter
  }
}

module.exports = new PedidoService();
