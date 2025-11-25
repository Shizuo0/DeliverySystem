-- Script de dados de teste para desenvolvimento
USE delivery_db;

-- ============================================
-- POPULAÇÃO DE DADOS - PARTE 1: ENTIDADES INDEPENDENTES
-- ============================================

-- 1.1 - INSERIR CLIENTES
INSERT INTO Clientes (nome, username, email, senha, telefone, cpf) VALUES
('Maria Silva', 'maria_silva', 'maria@email.com', 'senha123', '11999990001', '111.111.111-11'),
('João Souza', 'joao_souza', 'joao@email.com', 'senha123', '11999990002', '222.222.222-22'),
('Ana Oliveira', 'ana_oliveira', 'ana@email.com', 'senha123', '11999990003', '333.333.333-33'),
('Pedro Santos', 'pedro_santos', 'pedro@email.com', 'senha123', '11999990004', '444.444.444-44'),
('Carla Dias', 'carla_dias', 'carla@email.com', 'senha123', '11999990005', '555.555.555-55');

-- 1.2 - INSERIR RESTAURANTES
INSERT INTO Restaurantes (nome, username, email_admin, senha_admin, tipo_cozinha, telefone, cnpj, descricao, tempo_entrega_estimado, taxa_entrega, status_operacional) VALUES
('Pizzaria Bella Napoli', 'bella_napoli', 'contato@bellanapoli.com', 'admin123', 'Italiana', '1133330001', '12.345.678/0001-01', 'A melhor pizza da cidade', 45, 8.50, 'Aberto'),
('Burger King King', 'burger_king_king', 'gerencia@burgerkingking.com', 'admin123', 'Hamburgueria', '1133330002', '23.456.789/0001-02', 'Hambúrgueres artesanais', 30, 5.00, 'Aberto'),
('Sushi House', 'sushi_house', 'sushi@house.com', 'admin123', 'Japonesa', '1133330003', '34.567.890/0001-03', 'Sushi fresco todo dia', 50, 12.00, 'Fechado'),
('Pastelaria do Zé', 'pastelaria_ze', 'ze@pastel.com', 'admin123', 'Brasileira', '1133330004', '45.678.901/0001-04', 'Pastel de feira crocante', 25, 4.00, 'Aberto'),
('Taco Loco', 'taco_loco', 'hola@tacoloco.com', 'admin123', 'Mexicana', '1133330005', '56.789.012/0001-05', 'Comida mexicana apimentada', 40, 7.00, 'Fechado');

-- 1.3 - INSERIR ENTREGADORES
INSERT INTO Entregadores (nome, email, senha, telefone, status_disponibilidade) VALUES
('Roberto Motoboy', 'roberto@moto.com', 'moto123', '11988880001', 'Disponivel'),
('Fernanda Entregas', 'fernanda@bike.com', 'bike123', '11988880002', 'Em Entrega'),
('Carlos Rápido', 'carlos@flash.com', 'flash123', '11988880003', 'Indisponivel'),
('Juliana Express', 'ju@express.com', 'express123', '11988880004', 'Disponivel'),
('Marcos Veloz', 'marcos@veloz.com', 'veloz123', '11988880005', 'Disponivel');

-- ============================================
-- POPULAÇÃO DE DADOS - PARTE 2: ENTIDADES COM DEPENDÊNCIAS
-- ============================================

-- 2.1 - INSERIR ENDEREÇOS DOS CLIENTES (Depende de Clientes)
INSERT INTO EnderecosClientes (id_cliente, logradouro, numero, complemento, bairro, cidade, estado, cep, nome_identificador) VALUES
(1, 'Rua das Flores', '123', 'Apto 101', 'Centro', 'São Paulo', 'SP', '01001-000', 'Casa'),
(2, 'Av. Paulista', '1000', 'Sala 5', 'Bela Vista', 'São Paulo', 'SP', '01310-100', 'Trabalho'),
(3, 'Rua Augusta', '500', NULL, 'Consolação', 'São Paulo', 'SP', '01305-000', 'Casa'),
(4, 'Rua Oscar Freire', '200', 'Casa 2', 'Jardins', 'São Paulo', 'SP', '01426-000', 'Casa da Namorada'),
(5, 'Rua da Mooca', '80', NULL, 'Mooca', 'São Paulo', 'SP', '03103-000', 'Casa');

-- 2.2 - INSERIR ENDEREÇOS DOS RESTAURANTES (Depende de Restaurantes)
INSERT INTO EnderecosRestaurantes (id_restaurante, logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES
(1, 'Rua Vergueiro', '10', 'Loja A', 'Liberdade', 'São Paulo', 'SP', '01504-000'),
(2, 'Rua dos Pinheiros', '55', NULL, 'Pinheiros', 'São Paulo', 'SP', '05422-000'),
(3, 'Av. Liberdade', '888', NULL, 'Liberdade', 'São Paulo', 'SP', '01502-000'),
(4, 'Rua Tuiuti', '99', NULL, 'Tatuapé', 'São Paulo', 'SP', '03081-000'),
(5, 'Rua Itapura', '2020', 'Box 3', 'Tatuapé', 'São Paulo', 'SP', '03310-000');

-- 2.3 - INSERIR CATEGORIAS DE CARDÁPIO (Depende de Restaurantes)
INSERT INTO CategoriasCardapio (id_restaurante, nome_categoria) VALUES
(1, 'Pizzas Tradicionais'),
(1, 'Bebidas'),
(2, 'Burgers'),
(2, 'Acompanhamentos'),
(3, 'Combinados'),
(3, 'Temakis'),
(4, 'Pastéis Salgados'),
(5, 'Tacos');

-- 2.4 - INSERIR ITENS DO CARDÁPIO (Depende de Rest e Categorias)
INSERT INTO ItensCardapio (id_restaurante, id_categoria, nome, descricao, preco, disponivel) VALUES
(1, 1, 'Pizza Calabresa', 'Molho, mussarela e calabresa fatiada', 45.00, TRUE),
(1, 1, 'Pizza Marguerita', 'Molho, mussarela, tomate e manjericão', 42.00, TRUE),
(1, 2, 'Refrigerante 2L', 'Coca-Cola ou Guaraná', 12.00, TRUE),
(2, 3, 'X-Bacon', 'Hambúrguer 180g, queijo, bacon e molho especial', 28.00, TRUE),
(2, 4, 'Batata Frita', 'Porção individual de batatas', 10.00, TRUE),
(3, 5, 'Combo 1 (20 peças)', '10 sashimis, 5 niguiris, 5 uramakis', 65.00, TRUE),
(4, 7, 'Pastel de Carne', 'Carne moída temperada', 8.00, TRUE),
(4, 7, 'Pastel de Queijo', 'Queijo mussarela derretido', 8.00, TRUE),
(5, 8, 'Taco de Carne', 'Tortilla crocante com carne e chilli', 15.00, FALSE), -- Indisponível
(1, 1, 'Pizza Portuguesa', 'Presunto, ovo, cebola e ervilha', 48.00, TRUE);

-- 2.5 - INSERIR PEDIDOS (Depende de Cliente, Restaurante, Endereço, Entregador)
INSERT INTO Pedidos (id_cliente, id_restaurante, id_endereco_cliente, id_entregador, status, valor_total, metodo_pagamento, data_hora) VALUES
(1, 1, 1, 1, 'Entregue', 57.00, 'Cartão de Crédito', '2024-01-10 19:30:00'),
(2, 2, 2, 2, 'Em Preparo', 38.00, 'PIX', CURRENT_TIMESTAMP),
(3, 1, 3, 4, 'A Caminho', 45.00, 'Dinheiro', CURRENT_TIMESTAMP),
(1, 4, 1, 1, 'Entregue', 20.00, 'PIX', '2024-01-12 18:00:00'),
(5, 3, 5, NULL, 'Cancelado', 65.00, 'Cartão de Crédito', '2024-01-15 20:00:00'),
(4, 2, 4, NULL, 'Pendente', 38.00, 'Cartão de Débito', CURRENT_TIMESTAMP);

-- 2.6 - INSERIR ITENS DO PEDIDO (Depende de Pedido e ItemCardapio)
INSERT INTO ItensPedido (id_pedido, id_item_cardapio, quantidade, preco_unitario_gravado) VALUES
(1, 1, 1, 45.00), -- Pizza Calabresa
(1, 3, 1, 12.00), -- Refri
(2, 4, 1, 28.00), -- X-Bacon
(2, 5, 1, 10.00), -- Batata
(3, 1, 1, 45.00), -- Pizza Calabresa
(4, 7, 1, 8.00),  -- Pastel Carne
(4, 8, 1, 8.00),  -- Pastel Queijo
(5, 6, 1, 65.00), -- Combo Sushi
(6, 4, 1, 28.00); -- X-Bacon

-- 2.7 - INSERIR AVALIAÇÕES (Depende de Pedido)
INSERT INTO Avaliacoes (id_pedido, id_cliente, id_restaurante, nota, comentario) VALUES
(1, 1, 1, 5, 'Pizza chegou quentinha e muito saborosa!'),
(4, 1, 4, 4, 'Pastel muito bom, mas demorou um pouco.');
-- Obs: Pedidos não entregues ou cancelados geralmente não têm avaliação ainda.

-- Verificar dados inseridos
SELECT 'Clientes:', COUNT(*) FROM Clientes;
SELECT 'Endereços Clientes:', COUNT(*) FROM EnderecosClientes;
SELECT 'Restaurantes:', COUNT(*) FROM Restaurantes;
SELECT 'Itens Cardápio:', COUNT(*) FROM ItensCardapio;
SELECT 'Entregadores:', COUNT(*) FROM Entregadores;
SELECT 'Pedidos:', COUNT(*) FROM Pedidos;
SELECT 'Avaliações:', COUNT(*) FROM Avaliacoes;
