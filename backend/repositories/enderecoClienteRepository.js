const db = require('../config/database');

class EnderecoClienteRepository {
  // Criar novo endereço
  async create(enderecoData) {
    const query = `
      INSERT INTO EnderecosClientes 
      (id_cliente, logradouro, numero, complemento, bairro, cidade, estado, cep, nome_identificador)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      enderecoData.id_cliente,
      enderecoData.logradouro,
      enderecoData.numero,
      enderecoData.complemento || null,
      enderecoData.bairro,
      enderecoData.cidade,
      enderecoData.estado,
      enderecoData.cep,
      enderecoData.nome_identificador || null
    ]);
    return result.insertId;
  }

  // Buscar endereço por ID
  async findById(id) {
    const query = 'SELECT * FROM EnderecosClientes WHERE id_endereco_cliente = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Buscar endereços de um cliente
  async findByClienteId(clienteId) {
    const query = 'SELECT * FROM EnderecosClientes WHERE id_cliente = ?';
    const [rows] = await db.execute(query, [clienteId]);
    return rows;
  }

  // Atualizar endereço
  async update(id, enderecoData) {
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
    if (enderecoData.nome_identificador !== undefined) {
      fields.push('nome_identificador = ?');
      values.push(enderecoData.nome_identificador);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const query = `UPDATE EnderecosClientes SET ${fields.join(', ')} WHERE id_endereco_cliente = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Deletar endereço
  async delete(id) {
    const query = 'DELETE FROM EnderecosClientes WHERE id_endereco_cliente = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Verificar se endereço pertence ao cliente
  async belongsToCliente(enderecoId, clienteId) {
    const query = 'SELECT id_endereco_cliente FROM EnderecosClientes WHERE id_endereco_cliente = ? AND id_cliente = ?';
    const [rows] = await db.execute(query, [enderecoId, clienteId]);
    return rows.length > 0;
  }
}

module.exports = new EnderecoClienteRepository();
