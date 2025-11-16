class EnderecoRestaurante {
  constructor(data) {
    this.id_restaurante = data.id_restaurante;
    this.logradouro = data.logradouro;
    this.numero = data.numero;
    this.complemento = data.complemento;
    this.bairro = data.bairro;
    this.cidade = data.cidade;
    this.estado = data.estado;
    this.cep = data.cep;
  }
}

module.exports = EnderecoRestaurante;
