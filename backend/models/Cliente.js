class Cliente {
  constructor(data) {
    this.id_cliente = data.id_cliente;
    this.nome = data.nome;
    this.email = data.email;
    this.senha = data.senha;
    this.telefone = data.telefone;
    this.data_cadastro = data.data_cadastro;
  }

  // Método para ocultar senha ao retornar dados
  toJSON() {
    const obj = { ...this };
    delete obj.senha;
    return obj;
  }
}

module.exports = Cliente;
