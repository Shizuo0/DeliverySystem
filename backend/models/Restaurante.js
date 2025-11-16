class Restaurante {
  constructor(data) {
    this.id_restaurante = data.id_restaurante;
    this.nome = data.nome;
    this.email_admin = data.email_admin;
    this.senha_admin = data.senha_admin;
    this.tipo_cozinha = data.tipo_cozinha;
    this.telefone = data.telefone;
    this.status_operacional = data.status_operacional;
  }

  // Método para ocultar senha ao retornar dados
  toJSON() {
    const obj = { ...this };
    delete obj.senha_admin;
    return obj;
  }
}

module.exports = Restaurante;
