# Testes - Delivery System Backend

Este diretório contém todos os testes automatizados do sistema.

## Estrutura

```
__tests__/
├── controllers/       # Testes de integração (HTTP)
├── services/          # Testes unitários (lógica de negócio)
├── database/          # Testes de integridade do banco
├── resilience/        # Testes de pontos críticos de falha
└── README.md
```

## Tecnologias

- **Jest**: Framework de testes
- **Supertest**: Testes de API HTTP
- **Mocks**: Isolamento de dependências

## Executar Testes

```bash
# Todos os testes
npm test

# Com watch mode (desenvolvimento)
npm run test:watch

# Com coverage
npm test -- --coverage

# Apenas testes de um tipo
npm test -- controllers
npm test -- services
npm test -- database
npm test -- resilience
```

## Cobertura Atual

### Testes Unitários (services/)

#### authService.test.js (7 testes)
- ✅ Registro de cliente com sucesso
- ✅ Rejeitar email duplicado
- ✅ Login com credenciais válidas
- ✅ Rejeitar login com senha incorreta
- ✅ Rejeitar login com email inexistente
- ✅ Verificar token válido
- ✅ Rejeitar token inválido

#### pedidoService.test.js (6 testes)
- ✅ Criar pedido com sucesso
- ✅ Validar restaurante existe
- ✅ Validar restaurante está aberto
- ✅ Validar carrinho não vazio
- ✅ Atualizar status com sucesso
- ✅ Rejeitar transição de status inválida

#### avaliacaoService.test.js (5 testes)
- ✅ Criar avaliação após entrega
- ✅ Validar nota entre 1-5
- ✅ Rejeitar avaliação de pedido não entregue
- ✅ Rejeitar avaliação duplicada
- ✅ Calcular média de avaliações

### Testes de Integração (controllers/)

#### authController.test.js (3 testes)
- ✅ POST /auth/register com dados válidos
- ✅ POST /auth/register com dados inválidos (400)
- ✅ POST /auth/login com sucesso

### Testes de Integridade do Banco (database/)

#### integrity.test.js (24 testes)
- **Foreign Key Constraints** (6 testes)
  - ✅ Rejeitar pedido com id_cliente inválido
  - ✅ Rejeitar pedido com id_restaurante inválido
  - ✅ Rejeitar item_pedido com id_pedido inválido
  - ✅ Rejeitar avaliacao com id_pedido inválido
  - ✅ Rejeitar endereco_cliente com id_cliente inválido
  - ✅ Rejeitar item_cardapio com id_restaurante inválido

- **Cascade Delete** (2 testes)
  - ✅ Deletar endereços ao deletar cliente
  - ✅ Deletar itens_cardapio ao deletar restaurante

- **Unique Constraints** (3 testes)
  - ✅ Rejeitar email duplicado em Clientes
  - ✅ Rejeitar email_admin duplicado em Restaurantes
  - ✅ Rejeitar email duplicado em Entregadores

- **Data Type Validation** (5 testes)
  - ✅ Rejeitar ENUM inválido para status do pedido
  - ✅ Rejeitar ENUM inválido para metodo_pagamento
  - ✅ Rejeitar ENUM inválido para status do entregador
  - ✅ Rejeitar preço negativo
  - ✅ Rejeitar nota fora do range 1-5

- **NOT NULL Constraints** (3 testes)
  - ✅ Rejeitar cliente sem email
  - ✅ Rejeitar pedido sem status
  - ✅ Rejeitar item_cardapio sem preço

- **Transaction Integrity** (2 testes)
  - ✅ Rollback em erro de transação
  - ✅ Commit em transação bem-sucedida

#### connection.test.js (17 testes)
- **Connection Pool** (3 testes)
  - ✅ Estabelecer conexão com banco
  - ✅ Lidar com queries concorrentes
  - ✅ Reutilizar conexões do pool

- **Database Schema Validation** (8 testes)
  - ✅ Verificar existência de tabelas
  - ✅ Verificar colunas obrigatórias
  - ✅ Verificar foreign keys definidas

- **Error Handling** (3 testes)
  - ✅ Lidar com query SQL inválida
  - ✅ Lidar com erro de sintaxe SQL
  - ✅ Timeout em queries longas

- **Connection Recovery** (2 testes)
  - ✅ Liberar conexão corretamente
  - ✅ Query após release de conexão

### Testes de Resiliência (resilience/)

#### errorHandling.test.js (21 testes)
- **Error Handling Middleware** (5 testes)
- **Database Error Handling** (4 testes)
- **Service Layer Error Handling** (3 testes)
- **Critical Failure Points** (3 testes)
- **Resilience Tests** (2 testes)

## Estatísticas Totais

- **Total de Testes**: 83 testes
- **Cobertura de Módulos**:
  - 3 Services testados
  - 1 Controller testado
  - 24 validações de integridade de banco
  - 17 testes de conexão
  - 21 testes de resiliência

## Convenções

1. **Arrange-Act-Assert**: Estrutura de cada teste
2. **Mocks**: Camada de repository é mockada em testes unitários
3. **Cleanup**: `afterEach` limpa mocks / `afterAll` fecha conexões
4. **Nomes descritivos**: "Should X when Y"
5. **Isolamento**: Testes não dependem uns dos outros
6. **Dados de teste**: Timestamps únicos para evitar conflitos
