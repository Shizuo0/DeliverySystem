const db = require('../config/database');

class ItemCardapioRepository {
  // Criar item
  async create(itemData) {
    const query = `
      INSERT INTO ItensCardapio 
      (id_restaurante, id_categoria, nome, descricao, preco, disponivel)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      itemData.id_restaurante,
      itemData.id_categoria,
      itemData.nome,
      itemData.descricao || null,
      itemData.preco,
      itemData.disponivel !== undefined ? itemData.disponivel : true
    ]);
    return result.insertId;
  }

  // Buscar item por ID
  async findById(id) {
    const query = 'SELECT * FROM ItensCardapio WHERE id_item_cardapio = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Buscar itens por restaurante
  async findByRestauranteId(restauranteId) {
    const query = `
      SELECT ic.*, cc.nome_categoria
      FROM ItensCardapio ic
      JOIN CategoriasCardapio cc ON ic.id_categoria = cc.id_categoria
      WHERE ic.id_restaurante = ?
      ORDER BY cc.nome_categoria, ic.nome
    `;
    const [rows] = await db.execute(query, [restauranteId]);
    return rows;
  }

  // Buscar itens por categoria
  async findByCategoriaId(categoriaId) {
    const query = 'SELECT * FROM ItensCardapio WHERE id_categoria = ? ORDER BY nome';
    const [rows] = await db.execute(query, [categoriaId]);
    return rows;
  }

  // Buscar apenas itens disponíveis por restaurante
  async findAvailableByRestauranteId(restauranteId) {
    const query = `
      SELECT ic.*, cc.nome_categoria
      FROM ItensCardapio ic
      JOIN CategoriasCardapio cc ON ic.id_categoria = cc.id_categoria
      WHERE ic.id_restaurante = ? AND ic.disponivel = true
      ORDER BY cc.nome_categoria, ic.nome
    `;
    const [rows] = await db.execute(query, [restauranteId]);
    return rows;
  }

  // Atualizar item
  async update(id, itemData) {
    const fields = [];
    const values = [];

    if (itemData.id_categoria) {
      fields.push('id_categoria = ?');
      values.push(itemData.id_categoria);
    }
    if (itemData.nome) {
      fields.push('nome = ?');
      values.push(itemData.nome);
    }
    if (itemData.descricao !== undefined) {
      fields.push('descricao = ?');
      values.push(itemData.descricao);
    }
    if (itemData.preco !== undefined) {
      fields.push('preco = ?');
      values.push(itemData.preco);
    }
    if (itemData.disponivel !== undefined) {
      fields.push('disponivel = ?');
      values.push(itemData.disponivel);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const query = `UPDATE ItensCardapio SET ${fields.join(', ')} WHERE id_item_cardapio = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Deletar item
  async delete(id) {
    const query = 'DELETE FROM ItensCardapio WHERE id_item_cardapio = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Verificar se item pertence ao restaurante
  async belongsToRestaurante(itemId, restauranteId) {
    const query = 'SELECT id_item_cardapio FROM ItensCardapio WHERE id_item_cardapio = ? AND id_restaurante = ?';
    const [rows] = await db.execute(query, [itemId, restauranteId]);
    return rows.length > 0;
  }

  // Atualizar disponibilidade
  async updateDisponibilidade(id, disponivel) {
    const query = 'UPDATE ItensCardapio SET disponivel = ? WHERE id_item_cardapio = ?';
    const [result] = await db.execute(query, [disponivel, id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ItemCardapioRepository();
