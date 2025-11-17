const db = require('../config/database');

class ItemPedidoRepository {
  // Criar item do pedido
  async create(itemData) {
    const query = `
      INSERT INTO ItensPedido (
        id_pedido, id_item_cardapio, quantidade, preco_unitario_gravado
      ) VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      itemData.id_pedido,
      itemData.id_item_cardapio,
      itemData.quantidade,
      itemData.preco_unitario_gravado
    ]);
    return result.insertId;
  }

  // Criar múltiplos itens do pedido (bulk insert)
  async createMany(pedidoId, itens) {
    if (!itens || itens.length === 0) {
      return true;
    }

    const values = itens.map(item => 
      `(${pedidoId}, ${item.id_item_cardapio}, ${item.quantidade}, ${item.preco_unitario_gravado})`
    ).join(', ');

    const query = `
      INSERT INTO ItensPedido (
        id_pedido, id_item_cardapio, quantidade, preco_unitario_gravado
      ) VALUES ${values}
    `;
    
    const [result] = await db.execute(query);
    return result.affectedRows > 0;
  }

  // Buscar itens por pedido
  async findByPedidoId(pedidoId) {
    const query = `
      SELECT 
        ip.*,
        ic.nome as nome_item,
        ic.descricao as descricao_item
      FROM ItensPedido ip
      LEFT JOIN ItensCardapio ic ON ip.id_item_cardapio = ic.id_item_cardapio
      WHERE ip.id_pedido = ?
    `;
    const [rows] = await db.execute(query, [pedidoId]);
    return rows;
  }

  // Buscar item específico
  async findById(id) {
    const query = `
      SELECT 
        ip.*,
        ic.nome as nome_item,
        ic.descricao as descricao_item
      FROM ItensPedido ip
      LEFT JOIN ItensCardapio ic ON ip.id_item_cardapio = ic.id_item_cardapio
      WHERE ip.id_item_pedido = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Atualizar quantidade do item
  async updateQuantidade(id, quantidade) {
    const query = 'UPDATE ItensPedido SET quantidade = ? WHERE id_item_pedido = ?';
    const [result] = await db.execute(query, [quantidade, id]);
    return result.affectedRows > 0;
  }

  // Deletar item do pedido
  async delete(id) {
    const query = 'DELETE FROM ItensPedido WHERE id_item_pedido = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Deletar todos os itens de um pedido
  async deleteByPedidoId(pedidoId) {
    const query = 'DELETE FROM ItensPedido WHERE id_pedido = ?';
    const [result] = await db.execute(query, [pedidoId]);
    return result.affectedRows > 0;
  }
}

module.exports = new ItemPedidoRepository();
