class ItemPedido {
  constructor(itemData) {
    this.id_item_pedido = itemData.id_item_pedido;
    this.id_pedido = itemData.id_pedido;
    this.id_item_cardapio = itemData.id_item_cardapio;
    this.quantidade = itemData.quantidade;
    this.preco_unitario_gravado = itemData.preco_unitario_gravado;

    // Campos opcionais que podem vir de joins
    this.nome_item = itemData.nome_item;
    this.descricao_item = itemData.descricao_item;
  }

  toJSON() {
    const obj = {
      id_item_pedido: this.id_item_pedido,
      id_pedido: this.id_pedido,
      id_item_cardapio: this.id_item_cardapio,
      quantidade: this.quantidade,
      preco_unitario_gravado: parseFloat(this.preco_unitario_gravado),
      subtotal: parseFloat(this.preco_unitario_gravado) * this.quantidade
    };

    if (this.nome_item) obj.nome_item = this.nome_item;
    if (this.descricao_item) obj.descricao_item = this.descricao_item;

    return obj;
  }
}

module.exports = ItemPedido;
