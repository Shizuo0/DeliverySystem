class ItemCardapio {
  constructor(data) {
    this.id_item_cardapio = data.id_item_cardapio;
    this.id_restaurante = data.id_restaurante;
    this.id_categoria = data.id_categoria;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.preco = data.preco;
    this.disponivel = data.disponivel;
    this.categoria_nome = data.nome_categoria;
  }
}

module.exports = ItemCardapio;
