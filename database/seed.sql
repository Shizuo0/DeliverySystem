-- Script de dados de teste para desenvolvimento
USE delivery_db;

-- Inserir clientes de teste (senhas: senha123 - hash bcrypt)
INSERT INTO Clientes (nome, email, senha, telefone) VALUES
('João Silva', 'joao@example.com', '$2a$10$YourHashHere', '(85) 98888-7777'),
('Maria Santos', 'maria@example.com', '$2a$10$YourHashHere', '(85) 98777-6666'),
('Pedro Oliveira', 'pedro@example.com', '$2a$10$YourHashHere', '(85) 98666-5555');

-- Inserir endereços de clientes
INSERT INTO EnderecosClientes (id_cliente, logradouro, numero, complemento, bairro, cidade, estado, cep, nome_identificador) VALUES
(1, 'Rua das Flores', '123', 'Apto 45', 'Centro', 'Fortaleza', 'CE', '60000-000', 'Casa'),
(1, 'Av. Beira Mar', '456', NULL, 'Meireles', 'Fortaleza', 'CE', '60165-121', 'Trabalho'),
(2, 'Rua do Sol', '789', 'Casa 2', 'Aldeota', 'Fortaleza', 'CE', '60150-160', 'Casa'),
(3, 'Av. Washington Soares', '1000', 'Sala 301', 'Edson Queiroz', 'Fortaleza', 'CE', '60811-341', 'Escritório');

-- Inserir restaurantes
INSERT INTO Restaurantes (nome, email_admin, senha_admin, tipo_cozinha, telefone, status_operacional) VALUES
('Pizzaria Bella', 'admin@pizzariabella.com', '$2a$10$YourHashHere', 'Italiana', '(85) 3456-7890', 'Aberto'),
('Sushi House', 'admin@sushihouse.com', '$2a$10$YourHashHere', 'Japonesa', '(85) 3456-7891', 'Aberto'),
('Burger King Premium', 'admin@burgerpremium.com', '$2a$10$YourHashHere', 'Hamburgueria', '(85) 3456-7892', 'Fechado'),
('Cantina do Chef', 'admin@cantinachef.com', '$2a$10$YourHashHere', 'Brasileira', '(85) 3456-7893', 'Aberto');

-- Inserir endereços de restaurantes
INSERT INTO EnderecosRestaurantes (id_restaurante, logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES
(1, 'Rua da Pizza', '100', NULL, 'Centro', 'Fortaleza', 'CE', '60030-000'),
(2, 'Av. Dom Luís', '200', 'Loja 5', 'Meireles', 'Fortaleza', 'CE', '60160-230'),
(3, 'Rua dos Burgers', '300', NULL, 'Aldeota', 'Fortaleza', 'CE', '60150-000'),
(4, 'Av. Santos Dumont', '400', 'Térreo', 'Aldeota', 'Fortaleza', 'CE', '60150-161');

-- Inserir categorias de cardápio
INSERT INTO CategoriasCardapio (id_restaurante, nome_categoria) VALUES
(1, 'Pizzas Tradicionais'),
(1, 'Pizzas Especiais'),
(1, 'Bebidas'),
(2, 'Sushis'),
(2, 'Sashimis'),
(2, 'Temakis'),
(3, 'Burgers Clássicos'),
(3, 'Burgers Gourmet'),
(3, 'Acompanhamentos'),
(4, 'Pratos Executivos'),
(4, 'À La Carte');

-- Inserir itens de cardápio
-- Pizzaria Bella
INSERT INTO ItensCardapio (id_restaurante, id_categoria, nome, descricao, preco, disponivel) VALUES
(1, 1, 'Pizza Margherita', 'Molho de tomate, mussarela e manjericão', 35.00, true),
(1, 1, 'Pizza Calabresa', 'Molho de tomate, mussarela e calabresa', 38.00, true),
(1, 2, 'Pizza Quatro Queijos', 'Mussarela, parmesão, gorgonzola e catupiry', 45.00, true),
(1, 2, 'Pizza Portuguesa', 'Presunto, mussarela, ovos, cebola e azeitonas', 42.00, true),
(1, 3, 'Coca-Cola 2L', 'Refrigerante', 10.00, true),
(1, 3, 'Suco Natural 500ml', 'Sabores variados', 8.00, true);

-- Sushi House
INSERT INTO ItensCardapio (id_restaurante, id_categoria, nome, descricao, preco, disponivel) VALUES
(2, 4, 'Combo Sushi 20 peças', 'Variado de sushis', 55.00, true),
(2, 4, 'Hot Roll Philadelphia', '10 unidades', 35.00, true),
(2, 5, 'Sashimi Salmão', '12 fatias', 40.00, true),
(2, 6, 'Temaki Salmão', 'Tradicional', 18.00, true);

-- Burger Premium
INSERT INTO ItensCardapio (id_restaurante, id_categoria, nome, descricao, preco, disponivel) VALUES
(3, 7, 'X-Burger Clássico', 'Hambúrguer, queijo, alface, tomate', 25.00, false),
(3, 8, 'Burger Gourmet Bacon', 'Hambúrguer artesanal, bacon, queijo especial', 35.00, false),
(3, 9, 'Batata Frita', 'Porção grande', 15.00, false);

-- Cantina do Chef
INSERT INTO ItensCardapio (id_restaurante, id_categoria, nome, descricao, preco, disponivel) VALUES
(4, 10, 'Prato Executivo Carne', 'Carne, arroz, feijão, salada', 28.00, true),
(4, 10, 'Prato Executivo Frango', 'Frango grelhado, arroz, feijão, salada', 25.00, true),
(4, 11, 'Picanha na Chapa', '300g de picanha com acompanhamentos', 55.00, true);

-- Inserir entregadores
INSERT INTO Entregadores (nome, email, senha, telefone, status_disponibilidade) VALUES
('Carlos Delivery', 'carlos@delivery.com', '$2a$10$YourHashHere', '(85) 99111-2222', 'Online'),
('Ana Entrega', 'ana@delivery.com', '$2a$10$YourHashHere', '(85) 99222-3333', 'Online'),
('Bruno Motoboy', 'bruno@delivery.com', '$2a$10$YourHashHere', '(85) 99333-4444', 'Em Entrega'),
('Daniela Express', 'daniela@delivery.com', '$2a$10$YourHashHere', '(85) 99444-5555', 'Offline');

-- Inserir pedidos de exemplo
INSERT INTO Pedidos (id_cliente, id_restaurante, id_endereco_cliente, id_entregador, status, valor_total, metodo_pagamento) VALUES
(1, 1, 1, 1, 'Entregue', 53.00, 'Cartão de Crédito'),
(2, 2, 3, 2, 'A Caminho', 73.00, 'Dinheiro'),
(1, 4, 2, 3, 'Em Preparo', 55.00, 'PIX'),
(3, 1, 4, NULL, 'Pendente', 45.00, 'Cartão de Débito');

-- Inserir itens de pedido
-- Pedido 1 (Cliente 1, Pizzaria Bella)
INSERT INTO ItensPedido (id_pedido, id_item_cardapio, quantidade, preco_unitario_gravado) VALUES
(1, 1, 1, 35.00),
(1, 6, 2, 8.00),
(1, 5, 1, 10.00);

-- Pedido 2 (Cliente 2, Sushi House)
INSERT INTO ItensPedido (id_pedido, id_item_cardapio, quantidade, preco_unitario_gravado) VALUES
(2, 7, 1, 55.00),
(2, 10, 1, 18.00);

-- Pedido 3 (Cliente 1, Cantina do Chef)
INSERT INTO ItensPedido (id_pedido, id_item_cardapio, quantidade, preco_unitario_gravado) VALUES
(3, 13, 1, 55.00);

-- Pedido 4 (Cliente 3, Pizzaria Bella)
INSERT INTO ItensPedido (id_pedido, id_item_cardapio, quantidade, preco_unitario_gravado) VALUES
(4, 3, 1, 45.00);

-- Inserir avaliações
INSERT INTO Avaliacoes (id_pedido, id_cliente, id_restaurante, nota, comentario) VALUES
(1, 1, 1, 5, 'Pizza excelente! Entrega rápida.'),
(3, 1, 4, 4, 'Comida boa, mas poderia vir mais quente.');

-- Verificar dados inseridos
SELECT 'Clientes:', COUNT(*) FROM Clientes;
SELECT 'Endereços Clientes:', COUNT(*) FROM EnderecosClientes;
SELECT 'Restaurantes:', COUNT(*) FROM Restaurantes;
SELECT 'Itens Cardápio:', COUNT(*) FROM ItensCardapio;
SELECT 'Entregadores:', COUNT(*) FROM Entregadores;
SELECT 'Pedidos:', COUNT(*) FROM Pedidos;
SELECT 'Avaliações:', COUNT(*) FROM Avaliacoes;
