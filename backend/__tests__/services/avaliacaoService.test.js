const avaliacaoService = require('../../services/avaliacaoService');
const avaliacaoRepository = require('../../repositories/avaliacaoRepository');
const pedidoRepository = require('../../repositories/pedidoRepository');

jest.mock('../../repositories/avaliacaoRepository');
jest.mock('../../repositories/pedidoRepository');

describe('AvaliacaoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar avaliação após pedido entregue', async () => {
      const clienteId = 1;
      const avaliacaoData = {
        id_pedido: 1,
        nota: 5,
        comentario: 'Excelente!'
      };

      pedidoRepository.findById.mockResolvedValue({
        id_pedido: 1,
        id_cliente: clienteId,
        id_restaurante: 1,
        status: 'Entregue'
      });

      avaliacaoRepository.pedidoJaAvaliado.mockResolvedValue(false);
      avaliacaoRepository.create.mockResolvedValue(1);
      avaliacaoRepository.findById.mockResolvedValue({
        id_avaliacao: 1,
        ...avaliacaoData,
        id_restaurante: 1
      });

      const result = await avaliacaoService.create(clienteId, avaliacaoData);

      expect(pedidoRepository.findById).toHaveBeenCalledWith(1);
      expect(avaliacaoRepository.create).toHaveBeenCalled();
      expect(result.nota).toBe(5);
    });

    it('deve lançar erro se pedido não foi entregue', async () => {
      const clienteId = 1;
      const avaliacaoData = {
        id_pedido: 1,
        nota: 5
      };

      pedidoRepository.findById.mockResolvedValue({
        id_pedido: 1,
        id_cliente: clienteId,
        status: 'Pendente'
      });

      await expect(avaliacaoService.create(clienteId, avaliacaoData))
        .rejects.toThrow('Apenas pedidos entregues podem ser avaliados');
    });

    it('deve lançar erro se nota é inválida', async () => {
      const clienteId = 1;
      const avaliacaoData = {
        id_pedido: 1,
        nota: 6
      };

      pedidoRepository.findById.mockResolvedValue({
        id_pedido: 1,
        id_cliente: clienteId,
        status: 'Entregue'
      });

      avaliacaoRepository.pedidoJaAvaliado.mockResolvedValue(false);

      await expect(avaliacaoService.create(clienteId, avaliacaoData))
        .rejects.toThrow('Nota deve ser entre 1 e 5');
    });

    it('deve lançar erro se pedido já foi avaliado', async () => {
      const clienteId = 1;
      const avaliacaoData = {
        id_pedido: 1,
        nota: 5
      };

      pedidoRepository.findById.mockResolvedValue({
        id_pedido: 1,
        id_cliente: clienteId,
        status: 'Entregue'
      });

      avaliacaoRepository.pedidoJaAvaliado.mockResolvedValue(true);

      await expect(avaliacaoService.create(clienteId, avaliacaoData))
        .rejects.toThrow('Este pedido já foi avaliado');
    });
  });

  describe('getRestauranteMedia', () => {
    it('deve calcular média de avaliações', async () => {
      const restauranteId = 1;

      avaliacaoRepository.getRestauranteMedia.mockResolvedValue({
        media: 4.5,
        total: 10
      });

      const result = await avaliacaoService.getRestauranteMedia(restauranteId);

      expect(result.media).toBe('4.50');
      expect(result.total).toBe(10);
    });
  });
});
