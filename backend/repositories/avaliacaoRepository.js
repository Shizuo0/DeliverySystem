const db = require('../config/database');

class AvaliacaoRepository {
  // Criar avaliação
  async create(avaliacaoData) {
    const query = `
      INSERT INTO Avaliacoes (id_pedido, id_cliente, id_restaurante, nota, comentario)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      avaliacaoData.id_pedido,
      avaliacaoData.id_cliente,
      avaliacaoData.id_restaurante,
      avaliacaoData.nota,
      avaliacaoData.comentario || null
    ]);
    return result.insertId;
  }

  // Buscar por ID
  async findById(id) {
    const query = `
      SELECT 
        a.*,
        c.nome as cliente_nome,
        r.nome as restaurante_nome
      FROM Avaliacoes a
      LEFT JOIN Clientes c ON a.id_cliente = c.id_cliente
      LEFT JOIN Restaurantes r ON a.id_restaurante = r.id_restaurante
      WHERE a.id_avaliacao = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Buscar por pedido
  async findByPedidoId(pedidoId) {
    const query = `
      SELECT 
        a.*,
        c.nome as cliente_nome,
        r.nome as restaurante_nome
      FROM Avaliacoes a
      LEFT JOIN Clientes c ON a.id_cliente = c.id_cliente
      LEFT JOIN Restaurantes r ON a.id_restaurante = r.id_restaurante
      WHERE a.id_pedido = ?
    `;
    const [rows] = await db.execute(query, [pedidoId]);
    return rows[0];
  }

  // Buscar avaliações por restaurante
  async findByRestauranteId(restauranteId) {
    const query = `
      SELECT 
        a.*,
        c.nome as cliente_nome
      FROM Avaliacoes a
      LEFT JOIN Clientes c ON a.id_cliente = c.id_cliente
      WHERE a.id_restaurante = ?
      ORDER BY a.data_avaliacao DESC
    `;
    const [rows] = await db.execute(query, [restauranteId]);
    return rows;
  }

  // Buscar avaliações por cliente
  async findByClienteId(clienteId) {
    const query = `
      SELECT 
        a.*,
        r.nome as restaurante_nome
      FROM Avaliacoes a
      LEFT JOIN Restaurantes r ON a.id_restaurante = r.id_restaurante
      WHERE a.id_cliente = ?
      ORDER BY a.data_avaliacao DESC
    `;
    const [rows] = await db.execute(query, [clienteId]);
    return rows;
  }

  // Calcular média de avaliações do restaurante
  async getRestauranteMedia(restauranteId) {
    const query = `
      SELECT 
        COALESCE(AVG(nota), 0) as media,
        COUNT(*) as total
      FROM Avaliacoes
      WHERE id_restaurante = ?
    `;
    const [rows] = await db.execute(query, [restauranteId]);
    return rows[0];
  }

  // Atualizar avaliação
  async update(id, avaliacaoData) {
    const fields = [];
    const values = [];

    if (avaliacaoData.nota !== undefined) {
      fields.push('nota = ?');
      values.push(avaliacaoData.nota);
    }
    if (avaliacaoData.comentario !== undefined) {
      fields.push('comentario = ?');
      values.push(avaliacaoData.comentario);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const query = `UPDATE Avaliacoes SET ${fields.join(', ')} WHERE id_avaliacao = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Deletar avaliação
  async delete(id) {
    const query = 'DELETE FROM Avaliacoes WHERE id_avaliacao = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Verificar se pedido já tem avaliação
  async pedidoJaAvaliado(pedidoId) {
    const query = 'SELECT id_avaliacao FROM Avaliacoes WHERE id_pedido = ?';
    const [rows] = await db.execute(query, [pedidoId]);
    return rows.length > 0;
  }

  // Verificar se avaliação pertence ao cliente
  async belongsToCliente(avaliacaoId, clienteId) {
    const query = 'SELECT id_avaliacao FROM Avaliacoes WHERE id_avaliacao = ? AND id_cliente = ?';
    const [rows] = await db.execute(query, [avaliacaoId, clienteId]);
    return rows.length > 0;
  }
}

module.exports = new AvaliacaoRepository();
