const db = require('../config/database');

class EnderecoRestauranteRepository {
  // Criar endereço do restaurante
  async create(enderecoData) {
    const query = `
      INSERT INTO EnderecosRestaurantes 
      (id_restaurante, logradouro, numero, complemento, bairro, cidade, estado, cep)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      enderecoData.id_restaurante,
      enderecoData.logradouro,
      enderecoData.numero,
      enderecoData.complemento || null,
      enderecoData.bairro,
      enderecoData.cidade,
      enderecoData.estado,
      enderecoData.cep
    ]);
    return result.affectedRows > 0;
  }

  // Buscar endereço por ID do restaurante
  async findByRestauranteId(restauranteId) {
    const query = 'SELECT * FROM EnderecosRestaurantes WHERE id_restaurante = ?';
    const [rows] = await db.execute(query, [restauranteId]);
    return rows[0];
  }

  // Atualizar endereço
  async update(restauranteId, enderecoData) {
    const fields = [];
    const values = [];

    if (enderecoData.logradouro) {
      fields.push('logradouro = ?');
      values.push(enderecoData.logradouro);
    }
    if (enderecoData.numero) {
      fields.push('numero = ?');
      values.push(enderecoData.numero);
    }
    if (enderecoData.complemento !== undefined) {
      fields.push('complemento = ?');
      values.push(enderecoData.complemento);
    }
    if (enderecoData.bairro) {
      fields.push('bairro = ?');
      values.push(enderecoData.bairro);
    }
    if (enderecoData.cidade) {
      fields.push('cidade = ?');
      values.push(enderecoData.cidade);
    }
    if (enderecoData.estado) {
      fields.push('estado = ?');
      values.push(enderecoData.estado);
    }
    if (enderecoData.cep) {
      fields.push('cep = ?');
      values.push(enderecoData.cep);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(restauranteId);
    const query = `UPDATE EnderecosRestaurantes SET ${fields.join(', ')} WHERE id_restaurante = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Deletar endereço
  async delete(restauranteId) {
    const query = 'DELETE FROM EnderecosRestaurantes WHERE id_restaurante = ?';
    const [result] = await db.execute(query, [restauranteId]);
    return result.affectedRows > 0;
  }
}

module.exports = new EnderecoRestauranteRepository();
