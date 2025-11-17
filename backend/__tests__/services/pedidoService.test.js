const pedidoService = require('../../services/pedidoService');
const pedidoRepository = require('../../repositories/pedidoRepository');
const itemPedidoRepository = require('../../repositories/itemPedidoRepository');
const itemCardapioRepository = require('../../repositories/itemCardapioRepository');
const restauranteRepository = require('../../repositories/restauranteRepository');
const enderecoClienteRepository = require('../../repositories/enderecoClienteRepository');

jest.mock('../../repositories/pedidoRepository');
jest.mock('../../repositories/itemPedidoRepository');
jest.mock('../../repositories/itemCardapioRepository');
jest.mock('../../repositories/restauranteRepository');
jest.mock('../../repositories/enderecoClienteRepository');

describe('PedidoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFromCart', () => {
    it('deve criar pedido com sucesso', async () => {
      const clienteId = 1;
      const cartData = {
        id_restaurante: 1,
        id_endereco_cliente: 1,
        metodo_pagamento: 'PIX',
        itens: [
          { id_item_cardapio: 1, quantidade: 2 }
        ]
      };

      restauranteRepository.findById.mockResolvedValue({
        id_restaurante: 1,
        status_operacional: 'Aberto'
      });

      enderecoClienteRepository.findById.mockResolvedValue({
        id_endereco_cliente: 1,
        id_cliente: clienteId
      });

      itemCardapioRepository.findById.mockResolvedValue({
        id_item_cardapio: 1,
        id_restaurante: 1,
        nome: 'Pizza',
        preco: 30.00,
        disponivel: true
      });

      pedidoRepository.create.mockResolvedValue(1);
      itemPedidoRepository.createMany.mockResolvedValue(true);
      
      pedidoRepository.findById.mockResolvedValue({
        id_pedido: 1,
        id_cliente: clienteId,
        valor_total: 60.00,
        status: 'Pendente'
      });

      itemPedidoRepository.findByPedidoId.mockResolvedValue([
        {
          id_item_pedido: 1,
          quantidade: 2,
          preco_unitario_gravado: 30.00
        }
      ]);

      const result = await pedidoService.createFromCart(clienteId, cartData);

      expect(restauranteRepository.findById).toHaveBeenCalledWith(1);
      expect(enderecoClienteRepository.findById).toHaveBeenCalledWith(1);
      expect(itemCardapioRepository.findById).toHaveBeenCalledWith(1);
      expect(pedidoRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id_pedido');
    });

    it('deve lançar erro se restaurante não existe', async () => {
      const cartData = {
        id_restaurante: 999,
        id_endereco_cliente: 1,
        metodo_pagamento: 'PIX',
        itens: [{ id_item_cardapio: 1, quantidade: 1 }]
      };

      restauranteRepository.findById.mockResolvedValue(null);

      await expect(pedidoService.createFromCart(1, cartData))
        .rejects.toThrow('Restaurante não encontrado');
    });

    it('deve lançar erro se restaurante está fechado', async () => {
      const cartData = {
        id_restaurante: 1,
        id_endereco_cliente: 1,
        metodo_pagamento: 'PIX',
        itens: [{ id_item_cardapio: 1, quantidade: 1 }]
      };

      restauranteRepository.findById.mockResolvedValue({
        id_restaurante: 1,
        status_operacional: 'Fechado'
      });

      await expect(pedidoService.createFromCart(1, cartData))
        .rejects.toThrow('Restaurante está fechado no momento');
    });

    it('deve lançar erro se carrinho está vazio', async () => {
      const cartData = {
        id_restaurante: 1,
        id_endereco_cliente: 1,
        metodo_pagamento: 'PIX',
        itens: []
      };

      await expect(pedidoService.createFromCart(1, cartData))
        .rejects.toThrow('Carrinho vazio');
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar status com transição válida', async () => {
      const pedidoId = 1;
      const restauranteId = 1;

      pedidoRepository.belongsToRestaurante.mockResolvedValue(true);
      pedidoRepository.findById.mockResolvedValue({
        id_pedido: pedidoId,
        status: 'Pendente'
      });
      pedidoRepository.updateStatus.mockResolvedValue(true);
      
      pedidoRepository.findById.mockResolvedValueOnce({
        id_pedido: pedidoId,
        status: 'Pendente'
      }).mockResolvedValueOnce({
        id_pedido: pedidoId,
        status: 'Confirmado'
      });

      itemPedidoRepository.findByPedidoId.mockResolvedValue([]);

      const result = await pedidoService.updateStatus(pedidoId, restauranteId, 'Confirmado');

      expect(pedidoRepository.updateStatus).toHaveBeenCalledWith(pedidoId, 'Confirmado');
      expect(result.status).toBe('Confirmado');
    });

    it('deve lançar erro para transição inválida', async () => {
      const pedidoId = 1;
      const restauranteId = 1;

      pedidoRepository.belongsToRestaurante.mockResolvedValue(true);
      pedidoRepository.findById.mockResolvedValue({
        id_pedido: pedidoId,
        status: 'Entregue'
      });

      await expect(pedidoService.updateStatus(pedidoId, restauranteId, 'Pendente'))
        .rejects.toThrow('Não é possível mudar status');
    });
  });
});
