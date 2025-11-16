class CategoriaCardapio {
  constructor(data) {
    this.id_categoria = data.id_categoria;
    this.id_restaurante = data.id_restaurante;
    this.nome_categoria = data.nome_categoria;
  }
}

module.exports = CategoriaCardapio;
