const categoriaCardapioRepository = require('../repositories/categoriaCardapioRepository');
const restauranteRepository = require('../repositories/restauranteRepository');
const CategoriaCardapio = require('../models/CategoriaCardapio');

class CategoriaCardapioService {
  // Criar categoria
  async create(restauranteId, categoriaData) {
    // Verificar se restaurante existe
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }

    const id = await categoriaCardapioRepository.create({
      id_restaurante: restauranteId,
      nome_categoria: categoriaData.nome_categoria
    });

    const categoria = await categoriaCardapioRepository.findById(id);
    return new CategoriaCardapio(categoria);
  }

  // Listar categorias do restaurante
  async listByRestaurante(restauranteId) {
    const categorias = await categoriaCardapioRepository.findByRestauranteId(restauranteId);
    return categorias.map(c => new CategoriaCardapio(c));
  }

  // Obter categoria por ID
  async getById(categoriaId, restauranteId) {
    const categoria = await categoriaCardapioRepository.findById(categoriaId);
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }

    // Verificar se categoria pertence ao restaurante
    if (categoria.id_restaurante !== restauranteId) {
      throw new Error('Acesso negado a esta categoria');
    }

    return new CategoriaCardapio(categoria);
  }

  // Atualizar categoria
  async update(categoriaId, restauranteId, categoriaData) {
    // Verificar se categoria existe e pertence ao restaurante
    const belongsToRestaurante = await categoriaCardapioRepository.belongsToRestaurante(categoriaId, restauranteId);
    if (!belongsToRestaurante) {
      throw new Error('Categoria não encontrada ou acesso negado');
    }

    const updated = await categoriaCardapioRepository.update(categoriaId, categoriaData);
    if (!updated) {
      throw new Error('Erro ao atualizar categoria');
    }

    const categoria = await categoriaCardapioRepository.findById(categoriaId);
    return new CategoriaCardapio(categoria);
  }

  // Deletar categoria
  async delete(categoriaId, restauranteId) {
    // Verificar se categoria existe e pertence ao restaurante
    const belongsToRestaurante = await categoriaCardapioRepository.belongsToRestaurante(categoriaId, restauranteId);
    if (!belongsToRestaurante) {
      throw new Error('Categoria não encontrada ou acesso negado');
    }

    const deleted = await categoriaCardapioRepository.delete(categoriaId);
    if (!deleted) {
      throw new Error('Erro ao deletar categoria');
    }

    return true;
  }
}

module.exports = new CategoriaCardapioService();
