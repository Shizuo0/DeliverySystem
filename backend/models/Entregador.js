class Entregador {
  constructor(entregadorData) {
    this.id_entregador = entregadorData.id_entregador;
    this.nome = entregadorData.nome;
    this.email = entregadorData.email;
    this.telefone = entregadorData.telefone;
    this.status_disponibilidade = entregadorData.status_disponibilidade;
    
    // Não expor senha
    this.senha = undefined;
  }

  toJSON() {
    return {
      id_entregador: this.id_entregador,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      status_disponibilidade: this.status_disponibilidade
    };
  }
}

module.exports = Entregador;
