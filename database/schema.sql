DROP DATABASE IF EXISTS delivery_db;
CREATE DATABASE delivery_db;
USE delivery_db;

CREATE TABLE Clientes (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE EnderecosClientes (
    id_endereco_cliente INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(45) NOT NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    nome_identificador VARCHAR(45) NULL,
    FOREIGN KEY (id_cliente) REFERENCES Clientes (id_cliente)
);

CREATE TABLE Restaurantes (
    id_restaurante INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email_admin VARCHAR(255) NOT NULL UNIQUE,
    senha_admin VARCHAR(255) NOT NULL,
    tipo_cozinha VARCHAR(100) NULL,
    telefone VARCHAR(20) NULL,
    status_operacional ENUM('Aberto', 'Fechado') NOT NULL DEFAULT 'Fechado'
);

CREATE TABLE EnderecosRestaurantes (
    id_restaurante INT PRIMARY KEY,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(45) NOT NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    FOREIGN KEY (id_restaurante) REFERENCES Restaurantes (id_restaurante)
);

CREATE TABLE CategoriasCardapio (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    id_restaurante INT NOT NULL,
    nome_categoria VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_restaurante) REFERENCES Restaurantes (id_restaurante)
);

CREATE TABLE ItensCardapio (
    id_item_cardapio INT PRIMARY KEY AUTO_INCREMENT,
    id_restaurante INT NOT NULL,
    id_categoria INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    preco DECIMAL(10,2) NOT NULL,
    disponivel boolean NOT NULL,
    FOREIGN KEY (id_restaurante) REFERENCES Restaurantes (id_restaurante),
    FOREIGN KEY (id_categoria) REFERENCES CategoriasCardapio (id_categoria)
);

CREATE TABLE Entregadores (
    id_entregador INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    status_disponibilidade ENUM('Online', 'Offline', 'Em Entrega') NOT NULL DEFAULT 'Offline'
);

CREATE TABLE Pedidos (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    id_restaurante INT NOT NULL,
    id_endereco_cliente INT NOT NULL,
    id_entregador INT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pendente', 'Confirmado', 'Em Preparo', 'A Caminho', 'Entregue', 'Cancelado') NOT NULL DEFAULT 'Pendente',
    valor_total DECIMAL(10,2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Clientes (id_cliente),
    FOREIGN KEY (id_restaurante) REFERENCES Restaurantes (id_restaurante),
    FOREIGN KEY (id_endereco_cliente) REFERENCES EnderecosClientes (id_endereco_cliente),
    FOREIGN KEY (id_entregador) REFERENCES Entregadores (id_entregador)
);

CREATE TABLE ItensPedido (
    id_item_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_item_cardapio INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario_gravado DECIMAL(10,2) NOT NULL,
    UNIQUE (id_pedido, id_item_cardapio),
    FOREIGN KEY (id_pedido) REFERENCES Pedidos (id_pedido),
    FOREIGN KEY (id_item_cardapio) REFERENCES ItensCardapio (id_item_cardapio)
);

CREATE TABLE Avaliacoes (
    id_avaliacao INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    id_restaurante INT NOT NULL,
    nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT NULL,
    data_avaliacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos (id_pedido),
    FOREIGN KEY (id_cliente) REFERENCES Clientes (id_cliente),
    FOREIGN KEY (id_restaurante) REFERENCES Restaurantes (id_restaurante)
);
