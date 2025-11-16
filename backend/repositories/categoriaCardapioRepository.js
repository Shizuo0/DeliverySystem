const db = require('../config/database');

class CategoriaCardapioRepository {
  // Criar categoria
  async create(categoriaData) {
    const query = `
      INSERT INTO CategoriasCardapio (id_restaurante, nome_categoria)
      VALUES (?, ?)
    `;
    const [result] = await db.execute(query, [
      categoriaData.id_restaurante,
      categoriaData.nome_categoria
    ]);
    return result.insertId;
  }

  // Buscar categoria por ID
  async findById(id) {
    const query = 'SELECT * FROM CategoriasCardapio WHERE id_categoria = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Buscar categorias por restaurante
  async findByRestauranteId(restauranteId) {
    const query = 'SELECT * FROM CategoriasCardapio WHERE id_restaurante = ? ORDER BY nome_categoria';
    const [rows] = await db.execute(query, [restauranteId]);
    return rows;
  }

  // Atualizar categoria
  async update(id, categoriaData) {
    const query = 'UPDATE CategoriasCardapio SET nome_categoria = ? WHERE id_categoria = ?';
    const [result] = await db.execute(query, [categoriaData.nome_categoria, id]);
    return result.affectedRows > 0;
  }

  // Deletar categoria
  async delete(id) {
    const query = 'DELETE FROM CategoriasCardapio WHERE id_categoria = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Verificar se categoria pertence ao restaurante
  async belongsToRestaurante(categoriaId, restauranteId) {
    const query = 'SELECT id_categoria FROM CategoriasCardapio WHERE id_categoria = ? AND id_restaurante = ?';
    const [rows] = await db.execute(query, [categoriaId, restauranteId]);
    return rows.length > 0;
  }
}

module.exports = new CategoriaCardapioRepository();
