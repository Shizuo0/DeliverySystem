const db = require('../config/database');

class RestauranteRepository {
  // Criar novo restaurante
  async create(restauranteData) {
    const query = `
      INSERT INTO Restaurantes (nome, email_admin, senha_admin, tipo_cozinha, telefone, status_operacional)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      restauranteData.nome,
      restauranteData.email_admin,
      restauranteData.senha_admin,
      restauranteData.tipo_cozinha || null,
      restauranteData.telefone || null,
      restauranteData.status_operacional || 'Fechado'
    ]);
    return result.insertId;
  }

  // Buscar restaurante por ID
  async findById(id) {
    const query = 'SELECT * FROM Restaurantes WHERE id_restaurante = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Buscar restaurante por email admin
  async findByEmail(email) {
    const query = 'SELECT * FROM Restaurantes WHERE email_admin = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  // Atualizar restaurante
  async update(id, restauranteData) {
    const fields = [];
    const values = [];

    if (restauranteData.nome) {
      fields.push('nome = ?');
      values.push(restauranteData.nome);
    }
    if (restauranteData.email_admin) {
      fields.push('email_admin = ?');
      values.push(restauranteData.email_admin);
    }
    if (restauranteData.senha_admin) {
      fields.push('senha_admin = ?');
      values.push(restauranteData.senha_admin);
    }
    if (restauranteData.tipo_cozinha !== undefined) {
      fields.push('tipo_cozinha = ?');
      values.push(restauranteData.tipo_cozinha);
    }
    if (restauranteData.telefone !== undefined) {
      fields.push('telefone = ?');
      values.push(restauranteData.telefone);
    }
    if (restauranteData.status_operacional) {
      fields.push('status_operacional = ?');
      values.push(restauranteData.status_operacional);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const query = `UPDATE Restaurantes SET ${fields.join(', ')} WHERE id_restaurante = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Deletar restaurante
  async delete(id) {
    const query = 'DELETE FROM Restaurantes WHERE id_restaurante = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Listar todos os restaurantes
  async findAll() {
    const query = 'SELECT id_restaurante, nome, email_admin, tipo_cozinha, telefone, status_operacional FROM Restaurantes';
    const [rows] = await db.execute(query);
    return rows;
  }

  // Listar apenas restaurantes abertos
  async findOpen() {
    const query = `
      SELECT id_restaurante, nome, tipo_cozinha, telefone, status_operacional 
      FROM Restaurantes 
      WHERE status_operacional = 'Aberto'
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  // Verificar se email já existe
  async emailExists(email, excludeId = null) {
    let query = 'SELECT id_restaurante FROM Restaurantes WHERE email_admin = ?';
    const params = [email];
    
    if (excludeId) {
      query += ' AND id_restaurante != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }

  // Atualizar status operacional
  async updateStatus(id, status) {
    const query = 'UPDATE Restaurantes SET status_operacional = ? WHERE id_restaurante = ?';
    const [result] = await db.execute(query, [status, id]);
    return result.affectedRows > 0;
  }
}

module.exports = new RestauranteRepository();
