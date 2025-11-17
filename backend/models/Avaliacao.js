class Avaliacao {
  constructor(avaliacaoData) {
    this.id_avaliacao = avaliacaoData.id_avaliacao;
    this.id_pedido = avaliacaoData.id_pedido;
    this.id_cliente = avaliacaoData.id_cliente;
    this.id_restaurante = avaliacaoData.id_restaurante;
    this.nota = avaliacaoData.nota;
    this.comentario = avaliacaoData.comentario;
    this.data_avaliacao = avaliacaoData.data_avaliacao;

    // Campos opcionais que podem vir de joins
    this.cliente_nome = avaliacaoData.cliente_nome;
    this.restaurante_nome = avaliacaoData.restaurante_nome;
  }

  toJSON() {
    const obj = {
      id_avaliacao: this.id_avaliacao,
      id_pedido: this.id_pedido,
      id_cliente: this.id_cliente,
      id_restaurante: this.id_restaurante,
      nota: this.nota,
      comentario: this.comentario,
      data_avaliacao: this.data_avaliacao
    };

    if (this.cliente_nome) obj.cliente_nome = this.cliente_nome;
    if (this.restaurante_nome) obj.restaurante_nome = this.restaurante_nome;

    return obj;
  }
}

module.exports = Avaliacao;
