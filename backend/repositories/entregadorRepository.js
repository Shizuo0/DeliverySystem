const db = require('../config/database');

class EntregadorRepository {
  // Criar entregador
  async create(entregadorData) {
    const query = `
      INSERT INTO Entregadores (nome, email, senha, telefone, status_disponibilidade)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      entregadorData.nome,
      entregadorData.email,
      entregadorData.senha,
      entregadorData.telefone,
      entregadorData.status_disponibilidade || 'Offline'
    ]);
    return result.insertId;
  }

  // Buscar por ID
  async findById(id) {
    const query = 'SELECT * FROM Entregadores WHERE id_entregador = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Buscar por email
  async findByEmail(email) {
    const query = 'SELECT * FROM Entregadores WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  // Listar todos
  async findAll() {
    const query = 'SELECT * FROM Entregadores ORDER BY nome';
    const [rows] = await db.execute(query);
    return rows;
  }

  // Listar por status
  async findByStatus(status) {
    const query = 'SELECT * FROM Entregadores WHERE status_disponibilidade = ? ORDER BY nome';
    const [rows] = await db.execute(query, [status]);
    return rows;
  }

  // Listar entregadores online
  async findOnline() {
    return this.findByStatus('Online');
  }

  // Atualizar entregador
  async update(id, entregadorData) {
    const fields = [];
    const values = [];

    if (entregadorData.nome !== undefined) {
      fields.push('nome = ?');
      values.push(entregadorData.nome);
    }
    if (entregadorData.email !== undefined) {
      fields.push('email = ?');
      values.push(entregadorData.email);
    }
    if (entregadorData.senha !== undefined) {
      fields.push('senha = ?');
      values.push(entregadorData.senha);
    }
    if (entregadorData.telefone !== undefined) {
      fields.push('telefone = ?');
      values.push(entregadorData.telefone);
    }
    if (entregadorData.status_disponibilidade !== undefined) {
      fields.push('status_disponibilidade = ?');
      values.push(entregadorData.status_disponibilidade);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const query = `UPDATE Entregadores SET ${fields.join(', ')} WHERE id_entregador = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Atualizar status de disponibilidade
  async updateStatus(id, status) {
    const query = 'UPDATE Entregadores SET status_disponibilidade = ? WHERE id_entregador = ?';
    const [result] = await db.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Deletar entregador
  async delete(id) {
    const query = 'DELETE FROM Entregadores WHERE id_entregador = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Verificar se email existe
  async emailExists(email, excludeId = null) {
    let query = 'SELECT id_entregador FROM Entregadores WHERE email = ?';
    const params = [email];

    if (excludeId) {
      query += ' AND id_entregador != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }

  // Verificar se telefone existe
  async telefoneExists(telefone, excludeId = null) {
    let query = 'SELECT id_entregador FROM Entregadores WHERE telefone = ?';
    const params = [telefone];

    if (excludeId) {
      query += ' AND id_entregador != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }
}

module.exports = new EntregadorRepository();
