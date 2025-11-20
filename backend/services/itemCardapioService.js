const itemCardapioRepository = require('../repositories/itemCardapioRepository');
const categoriaCardapioRepository = require('../repositories/categoriaCardapioRepository');
const restauranteRepository = require('../repositories/restauranteRepository');
const ItemCardapio = require('../models/ItemCardapio');

class ItemCardapioService {
  // Criar item
  async create(restauranteId, itemData) {
    // Verificar se restaurante existe
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }

    // Verificar se categoria existe e pertence ao restaurante
    const categoria = await categoriaCardapioRepository.findById(itemData.id_categoria);
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }
    if (categoria.id_restaurante !== restauranteId) {
      throw new Error('Categoria não pertence a este restaurante');
    }

    const id = await itemCardapioRepository.create({
      id_restaurante: restauranteId,
      ...itemData
    });

    const item = await itemCardapioRepository.findById(id);
    return new ItemCardapio(item);
  }

  // Listar itens do restaurante
  async listByRestaurante(restauranteId) {
    const itens = await itemCardapioRepository.findByRestauranteId(restauranteId);
    return itens.map(i => new ItemCardapio(i));
  }

  // Listar apenas itens disponíveis do restaurante
  async listAvailableByRestaurante(restauranteId) {
    const itens = await itemCardapioRepository.findAvailableByRestauranteId(restauranteId);
    return itens.map(i => new ItemCardapio(i));
  }

  // Listar itens por categoria
  async listByCategoria(categoriaId, restauranteId) {
    // Verificar se categoria pertence ao restaurante
    const belongsToRestaurante = await categoriaCardapioRepository.belongsToRestaurante(categoriaId, restauranteId);
    if (!belongsToRestaurante) {
      throw new Error('Categoria não encontrada ou acesso negado');
    }

    const itens = await itemCardapioRepository.findByCategoriaId(categoriaId);
    return itens.map(i => new ItemCardapio(i));
  }

  // Obter item por ID
  async getById(itemId, restauranteId) {
    const item = await itemCardapioRepository.findById(itemId);
    if (!item) {
      throw new Error('Item não encontrado');
    }

    // Verificar se item pertence ao restaurante
    if (item.id_restaurante !== restauranteId) {
      throw new Error('Acesso negado a este item');
    }

    return new ItemCardapio(item);
  }

  // Atualizar item
  async update(restauranteId, itemId, itemData) {
    // Verificar se item existe e pertence ao restaurante
    const belongsToRestaurante = await itemCardapioRepository.belongsToRestaurante(itemId, restauranteId);
    if (!belongsToRestaurante) {
      throw new Error('Item não encontrado ou acesso negado');
    }

    // Se está mudando de categoria, verificar se a nova categoria pertence ao restaurante
    if (itemData.id_categoria) {
      const categoria = await categoriaCardapioRepository.findById(itemData.id_categoria);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }
      if (categoria.id_restaurante !== restauranteId) {
        throw new Error('Categoria não pertence a este restaurante');
      }
    }

    const updated = await itemCardapioRepository.update(itemId, itemData);
    if (!updated) {
      throw new Error('Erro ao atualizar item');
    }

    const item = await itemCardapioRepository.findById(itemId);
    return new ItemCardapio(item);
  }

  // Deletar item
  async delete(restauranteId, itemId) {
    // Verificar se item existe e pertence ao restaurante
    const belongsToRestaurante = await itemCardapioRepository.belongsToRestaurante(itemId, restauranteId);
    if (!belongsToRestaurante) {
      throw new Error('Item não encontrado ou acesso negado');
    }

    const deleted = await itemCardapioRepository.delete(itemId);
    if (!deleted) {
      throw new Error('Erro ao deletar item');
    }

    return true;
  }

  // Atualizar disponibilidade
  async updateDisponibilidade(restauranteId, itemId, disponivel) {
    // Verificar se item existe e pertence ao restaurante
    const belongsToRestaurante = await itemCardapioRepository.belongsToRestaurante(itemId, restauranteId);
    if (!belongsToRestaurante) {
      throw new Error('Item não encontrado ou acesso negado');
    }

    const updated = await itemCardapioRepository.updateDisponibilidade(itemId, disponivel);
    if (!updated) {
      throw new Error('Erro ao atualizar disponibilidade');
    }

    const item = await itemCardapioRepository.findById(itemId);
    return new ItemCardapio(item);
  }

  // Obter cardápio completo do restaurante (público)
  async getCardapioCompleto(restauranteId) {
    // Verificar se restaurante existe e está aberto
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }

    // Buscar categorias
    const categorias = await categoriaCardapioRepository.findByRestauranteId(restauranteId);
    
    // Buscar itens disponíveis
    const itens = await itemCardapioRepository.findAvailableByRestauranteId(restauranteId);

    // Organizar itens por categoria
    const cardapio = categorias.map(categoria => ({
      ...categoria,
      itens: itens.filter(item => item.id_categoria === categoria.id_categoria)
    }));

    return {
      restaurante: {
        id_restaurante: restaurante.id_restaurante,
        nome: restaurante.nome,
        tipo_cozinha: restaurante.tipo_cozinha,
        status_operacional: restaurante.status_operacional
      },
      cardapio
    };
  }
}

module.exports = new ItemCardapioService();
