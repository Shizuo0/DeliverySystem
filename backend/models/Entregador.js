class Entregador {
  constructor(entregadorData) {
    this.id_entregador = entregadorData.id_entregador;
    this.nome = entregadorData.nome;
    this.email = entregadorData.email;
    this.telefone = entregadorData.telefone;
    this.status_disponibilidade = entregadorData.status_disponibilidade;
    
    if (entregadorData.active_order_id) {
      this.active_order = {
        id: entregadorData.active_order_id,
        status: entregadorData.active_order_status,
        client_name: entregadorData.active_order_client_name
      };
    }

    // Não expor senha
    this.senha = undefined;
  }

  toJSON() {
    const obj = {
      id_entregador: this.id_entregador,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      status_disponibilidade: this.status_disponibilidade
    };

    if (this.active_order) {
      obj.active_order = this.active_order;
    }

    return obj;
  }
}

module.exports = Entregador;
