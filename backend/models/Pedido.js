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
    this.avaliacao = pedidoData.id_avaliacao ? true : false;

    // Campos opcionais que podem vir de joins
    this.cliente_nome = pedidoData.cliente_nome;
    this.cliente_telefone = pedidoData.cliente_telefone;
    
    this.restaurante_nome = pedidoData.restaurante_nome;
    this.restaurante_telefone = pedidoData.restaurante_telefone;
    this.restaurante_tipo_cozinha = pedidoData.restaurante_tipo_cozinha;
    
    this.entregador_nome = pedidoData.entregador_nome;
    
    // Endereço
    if (pedidoData.end_logradouro) {
      this.endereco_entrega = {
        logradouro: pedidoData.end_logradouro,
        numero: pedidoData.end_numero,
        complemento: pedidoData.end_complemento,
        bairro: pedidoData.end_bairro,
        cidade: pedidoData.end_cidade,
        estado: pedidoData.end_estado,
        cep: pedidoData.end_cep
      };
    }

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
      metodo_pagamento: this.metodo_pagamento,
      avaliacao: this.avaliacao
    };

    if (this.cliente_nome) {
      obj.cliente = {
        nome: this.cliente_nome,
        telefone: this.cliente_telefone
      };
    }

    if (this.restaurante_nome) {
      obj.restaurante = {
        nome: this.restaurante_nome,
        telefone: this.restaurante_telefone,
        tipo_cozinha: this.restaurante_tipo_cozinha
      };
    }

    if (this.entregador_nome) obj.entregador_nome = this.entregador_nome;
    
    if (this.endereco_entrega) obj.endereco_entrega = this.endereco_entrega;
    
    if (this.itens && this.itens.length > 0) obj.itens = this.itens;

    return obj;
  }
}

module.exports = Pedido;
