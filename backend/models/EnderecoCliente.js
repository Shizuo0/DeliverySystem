class EnderecoCliente {
  constructor(data) {
    this.id_endereco_cliente = data.id_endereco_cliente;
    this.id_cliente = data.id_cliente;
    this.logradouro = data.logradouro;
    this.numero = data.numero;
    this.complemento = data.complemento;
    this.bairro = data.bairro;
    this.cidade = data.cidade;
    this.estado = data.estado;
    this.cep = data.cep;
    this.nome_identificador = data.nome_identificador;
  }
}

module.exports = EnderecoCliente;
