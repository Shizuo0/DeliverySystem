const enderecoRestauranteRepository = require('../repositories/enderecoRestauranteRepository');
const restauranteRepository = require('../repositories/restauranteRepository');
const EnderecoRestaurante = require('../models/EnderecoRestaurante');

class EnderecoRestauranteService {
  // Criar endereço do restaurante
  async create(restauranteId, enderecoData) {
    // Verificar se restaurante existe
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }

    // Verificar se já existe endereço
    const enderecoExistente = await enderecoRestauranteRepository.findByRestauranteId(restauranteId);
    if (enderecoExistente) {
      throw new Error('Restaurante já possui um endereço cadastrado. Use atualização.');
    }

    const created = await enderecoRestauranteRepository.create({
      id_restaurante: restauranteId,
      ...enderecoData
    });

    if (!created) {
      throw new Error('Erro ao criar endereço');
    }

    const endereco = await enderecoRestauranteRepository.findByRestauranteId(restauranteId);
    return new EnderecoRestaurante(endereco);
  }

  // Obter endereço do restaurante
  async getByRestauranteId(restauranteId) {
    const endereco = await enderecoRestauranteRepository.findByRestauranteId(restauranteId);
    if (!endereco) {
      throw new Error('Endereço não encontrado');
    }
    return new EnderecoRestaurante(endereco);
  }

  // Atualizar endereço
  async update(restauranteId, enderecoData) {
    // Verificar se endereço existe
    const endereco = await enderecoRestauranteRepository.findByRestauranteId(restauranteId);
    if (!endereco) {
      throw new Error('Endereço não encontrado');
    }

    const updated = await enderecoRestauranteRepository.update(restauranteId, enderecoData);
    if (!updated) {
      throw new Error('Erro ao atualizar endereço');
    }

    const enderecoAtualizado = await enderecoRestauranteRepository.findByRestauranteId(restauranteId);
    return new EnderecoRestaurante(enderecoAtualizado);
  }

  // Deletar endereço
  async delete(restauranteId) {
    const deleted = await enderecoRestauranteRepository.delete(restauranteId);
    if (!deleted) {
      throw new Error('Erro ao deletar endereço');
    }
    return true;
  }
}

module.exports = new EnderecoRestauranteService();
