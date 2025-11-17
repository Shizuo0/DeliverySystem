# Documentação da API - Delivery System

## Base URL
```
http://localhost:3000/api
```

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login ou registro, um token é retornado que deve ser incluído no header das requisições protegidas:

```
Authorization: Bearer {token}
```

## Tipos de Usuários

1. **Cliente** - Usa token de `/auth/login` ou `/auth/register`
2. **Restaurante** - Usa token de `/restaurantes/login` ou `/restaurantes/register`

---

## Endpoints

### 🔐 Autenticação de Clientes

#### Registrar Cliente
```http
POST /api/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "telefone": "(85) 98765-4321"
}
```

**Resposta (201 Created):**
```json
{
  "message": "Cliente registrado com sucesso",
  "cliente": {
    "id_cliente": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "(85) 98765-4321"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login Cliente
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

---

### 👤 Perfil do Cliente

#### Ver Perfil (Autenticado)
```http
GET /api/clientes/perfil
Authorization: Bearer {token}
```

#### Atualizar Perfil
```http
PUT /api/clientes/perfil
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva Junior",
  "telefone": "(85) 99999-8888"
}
```

#### Alterar Senha
```http
PUT /api/clientes/senha
Authorization: Bearer {token}
Content-Type: application/json

{
  "senhaAtual": "senha123",
  "novaSenha": "novaSenha456"
}
```

---

### 📍 Endereços do Cliente

#### Criar Endereço
```http
POST /api/clientes/enderecos
Authorization: Bearer {token}
Content-Type: application/json

{
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Apto 101",
  "bairro": "Centro",
  "cidade": "Fortaleza",
  "estado": "CE",
  "cep": "60000-000",
  "nome_identificador": "Casa"
}
```

#### Listar Endereços
```http
GET /api/clientes/enderecos
Authorization: Bearer {token}
```

#### Atualizar Endereço
```http
PUT /api/clientes/enderecos/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "complemento": "Apto 102"
}
```

#### Deletar Endereço
```http
DELETE /api/clientes/enderecos/1
Authorization: Bearer {token}
```

---

### 🍕 Restaurantes (Públicos)

#### Listar Todos os Restaurantes
```http
GET /api/restaurantes
```

#### Listar Restaurantes Abertos
```http
GET /api/restaurantes/abertos
```

#### Ver Detalhes do Restaurante
```http
GET /api/restaurantes/1
```

#### Ver Cardápio Completo
```http
GET /api/restaurantes/1/cardapio
```

**Resposta:**
```json
{
  "restaurante": {
    "id_restaurante": 1,
    "nome": "Pizzaria Bella"
  },
  "categorias": [
    {
      "id_categoria": 1,
      "nome_categoria": "Pizzas",
      "itens": [
        {
          "id_item_cardapio": 1,
          "nome": "Pizza Margherita",
          "descricao": "Molho de tomate, mussarela e manjericão",
          "preco": 35.00,
          "disponivel": true
        }
      ]
    }
  ]
}
```

---

### 🏪 Gestão de Restaurantes (Autenticado)

#### Registrar Restaurante
```http
POST /api/restaurantes/register
Content-Type: application/json

{
  "nome": "Pizzaria Bella",
  "email_admin": "admin@pizzabella.com",
  "senha_admin": "senha123",
  "tipo_cozinha": "Italiana",
  "telefone": "(85) 98765-4321"
}
```

#### Login Restaurante
```http
POST /api/restaurantes/login
Content-Type: application/json

{
  "email_admin": "admin@pizzabella.com",
  "senha_admin": "senha123"
}
```

#### Atualizar Status Operacional
```http
PUT /api/restaurantes/status
Authorization: Bearer {token_restaurante}
Content-Type: application/json

{
  "status": "Aberto"
}
```
*Valores válidos: "Aberto", "Fechado"*

---

### 🍽️ Cardápio (Restaurante Autenticado)

#### Criar Categoria
```http
POST /api/restaurantes/categorias
Authorization: Bearer {token_restaurante}
Content-Type: application/json

{
  "nome_categoria": "Pizzas"
}
```

#### Criar Item do Cardápio
```http
POST /api/restaurantes/menu/itens
Authorization: Bearer {token_restaurante}
Content-Type: application/json

{
  "id_categoria": 1,
  "nome": "Pizza Margherita",
  "descricao": "Molho de tomate, mussarela e manjericão",
  "preco": 35.00,
  "disponivel": true
}
```

#### Listar Itens do Cardápio
```http
GET /api/restaurantes/menu/itens
Authorization: Bearer {token_restaurante}
```

#### Atualizar Disponibilidade
```http
PUT /api/restaurantes/menu/itens/1/disponibilidade
Authorization: Bearer {token_restaurante}
Content-Type: application/json

{
  "disponivel": false
}
```

---

### 🛒 Pedidos (Cliente)

#### Criar Pedido
```http
POST /api/pedidos/cliente
Authorization: Bearer {token_cliente}
Content-Type: application/json

{
  "id_restaurante": 1,
  "id_endereco_cliente": 1,
  "metodo_pagamento": "PIX",
  "itens": [
    {
      "id_item_cardapio": 1,
      "quantidade": 2
    },
    {
      "id_item_cardapio": 2,
      "quantidade": 1
    }
  ]
}
```
*Métodos de pagamento: "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Vale-Refeição"*

**Resposta (201 Created):**
```json
{
  "message": "Pedido criado com sucesso",
  "pedido": {
    "id_pedido": 1,
    "id_cliente": 1,
    "id_restaurante": 1,
    "status": "Pendente",
    "valor_total": 105.00,
    "metodo_pagamento": "PIX",
    "data_hora": "2025-11-17T10:30:00.000Z",
    "itens": [
      {
        "id_item_cardapio": 1,
        "nome_item": "Pizza Margherita",
        "quantidade": 2,
        "preco_unitario_gravado": 35.00,
        "subtotal": 70.00
      }
    ]
  }
}
```

#### Listar Meus Pedidos
```http
GET /api/pedidos/cliente
Authorization: Bearer {token_cliente}
```

#### Ver Detalhes do Pedido
```http
GET /api/pedidos/cliente/1
Authorization: Bearer {token_cliente}
```

#### Cancelar Pedido (apenas se Pendente)
```http
PUT /api/pedidos/cliente/1/cancelar
Authorization: Bearer {token_cliente}
```

---

### 📦 Pedidos (Restaurante)

#### Listar Pedidos do Restaurante
```http
GET /api/pedidos/restaurante
Authorization: Bearer {token_restaurante}
```

#### Filtrar por Status
```http
GET /api/pedidos/restaurante?status=Pendente
Authorization: Bearer {token_restaurante}
```
*Status: "Pendente", "Confirmado", "Em Preparo", "A Caminho", "Entregue", "Cancelado"*

#### Atualizar Status do Pedido
```http
PUT /api/pedidos/restaurante/1/status
Authorization: Bearer {token_restaurante}
Content-Type: application/json

{
  "status": "Confirmado"
}
```

**Workflow de Status:**
```
Pendente → Confirmado → Em Preparo → A Caminho → Entregue
         ↓           ↓             ↓
       Cancelado  Cancelado    Cancelado
```

#### Atribuir Entregador (quando status = "A Caminho")
```http
PUT /api/pedidos/restaurante/1/entregador
Authorization: Bearer {token_restaurante}
Content-Type: application/json

{
  "id_entregador": 1
}
```

---

### 🚴 Entregadores

#### Criar Entregador
```http
POST /api/entregadores
Content-Type: application/json

{
  "nome": "Carlos Entregador",
  "email": "carlos@example.com",
  "senha": "senha123",
  "telefone": "(85) 97777-6666"
}
```

#### Listar Todos os Entregadores
```http
GET /api/entregadores
```

#### Listar Entregadores Online
```http
GET /api/entregadores/online
```

#### Atualizar Status do Entregador
```http
PUT /api/entregadores/1/status
Content-Type: application/json

{
  "status": "Online"
}
```
*Status: "Online", "Offline", "Em Entrega"*

---

### ⭐ Avaliações

#### Criar Avaliação (Cliente, após entrega)
```http
POST /api/avaliacoes/cliente
Authorization: Bearer {token_cliente}
Content-Type: application/json

{
  "id_pedido": 1,
  "nota": 5,
  "comentario": "Excelente! Pizza deliciosa e entrega rápida."
}
```
*Nota: 1 a 5 estrelas*

#### Listar Minhas Avaliações
```http
GET /api/avaliacoes/cliente
Authorization: Bearer {token_cliente}
```

#### Atualizar Avaliação
```http
PUT /api/avaliacoes/cliente/1
Authorization: Bearer {token_cliente}
Content-Type: application/json

{
  "nota": 4,
  "comentario": "Muito bom!"
}
```

#### Ver Feedback do Restaurante (Restaurante Autenticado)
```http
GET /api/avaliacoes/restaurante
Authorization: Bearer {token_restaurante}
```

#### Ver Média de Avaliações (Restaurante Autenticado)
```http
GET /api/avaliacoes/restaurante/media
Authorization: Bearer {token_restaurante}
```

**Resposta:**
```json
{
  "media": "4.50",
  "total": 10
}
```

#### Ver Avaliações de um Restaurante (Público)
```http
GET /api/avaliacoes/restaurante/1
```

#### Ver Média de um Restaurante (Público)
```http
GET /api/avaliacoes/restaurante/1/media
```

---

## Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token ausente ou inválido
- `403 Forbidden` - Sem permissão para acessar recurso
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

## Estrutura de Erro

```json
{
  "error": "Mensagem de erro descritiva"
}
```

## Validações

```json
{
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    },
    {
      "field": "senha",
      "message": "Senha deve ter no mínimo 6 caracteres"
    }
  ]
}
```

---

## Health Check

```http
GET /api/health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```
