class Pedido {
  constructor(pedidoData) {
    this.id_pedido = pedidoData.id_pedido;
    this.id_cliente = pedidoData.id_cliente;
    this.id_restaurante = pedidoData.id_restaurante;
    this.id_endereco_cliente = pedidoData.id_endereco_cliente;
    this.id_entregador = pedidoData.id_entregador;
    this.data_hora = pedidoData.data_hora;
    this.status = pedidoData.status;
    this.valor_total = pedidoData.valor_total;
    this.metodo_pagamento = pedidoData.metodo_pagamento;

    // Campos opcionais que podem vir de joins
    this.cliente_nome = pedidoData.cliente_nome;
    this.restaurante_nome = pedidoData.restaurante_nome;
    this.entregador_nome = pedidoData.entregador_nome;
    this.itens = pedidoData.itens || [];
  }

  toJSON() {
    const obj = {
      id_pedido: this.id_pedido,
      id_cliente: this.id_cliente,
      id_restaurante: this.id_restaurante,
      id_endereco_cliente: this.id_endereco_cliente,
      id_entregador: this.id_entregador,
      data_hora: this.data_hora,
      status: this.status,
      valor_total: parseFloat(this.valor_total),
      metodo_pagamento: this.metodo_pagamento
    };

    if (this.cliente_nome) obj.cliente_nome = this.cliente_nome;
    if (this.restaurante_nome) obj.restaurante_nome = this.restaurante_nome;
    if (this.entregador_nome) obj.entregador_nome = this.entregador_nome;
    if (this.itens && this.itens.length > 0) obj.itens = this.itens;

    return obj;
  }
}

module.exports = Pedido;
