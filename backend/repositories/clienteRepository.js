const db = require('../config/database');

class ClienteRepository {
  // Criar novo cliente
  async create(clienteData) {
    const query = `
      INSERT INTO Clientes (nome, email, senha, telefone)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      clienteData.nome,
      clienteData.email,
      clienteData.senha,
      clienteData.telefone
    ]);
    return result.insertId;
  }

  // Buscar cliente por ID
  async findById(id) {
    const query = 'SELECT * FROM Clientes WHERE id_cliente = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Buscar cliente por email
  async findByEmail(email) {
    const query = 'SELECT * FROM Clientes WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  // Atualizar cliente
  async update(id, clienteData) {
    const fields = [];
    const values = [];

    if (clienteData.nome) {
      fields.push('nome = ?');
      values.push(clienteData.nome);
    }
    if (clienteData.telefone) {
      fields.push('telefone = ?');
      values.push(clienteData.telefone);
    }
    if (clienteData.email) {
      fields.push('email = ?');
      values.push(clienteData.email);
    }
    if (clienteData.senha) {
      fields.push('senha = ?');
      values.push(clienteData.senha);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const query = `UPDATE Clientes SET ${fields.join(', ')} WHERE id_cliente = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Deletar cliente
  async delete(id) {
    const query = 'DELETE FROM Clientes WHERE id_cliente = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Listar todos os clientes
  async findAll() {
    const query = 'SELECT id_cliente, nome, email, telefone, data_cadastro FROM Clientes';
    const [rows] = await db.execute(query);
    return rows;
  }

  // Verificar se email já existe
  async emailExists(email, excludeId = null) {
    let query = 'SELECT id_cliente FROM Clientes WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      query += ' AND id_cliente != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }
}

module.exports = new ClienteRepository();
