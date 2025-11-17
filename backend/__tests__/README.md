# Test Coverage Report

Este diretório contém os testes unitários e de integração do backend.

## Estrutura

- `services/` - Testes unitários dos services
- `controllers/` - Testes de integração dos controllers
- `repositories/` - Testes dos repositórios (quando necessário)

## Executar testes

```bash
# Todos os testes
npm test

# Com watch mode
npm run test:watch

# Com coverage
npm test -- --coverage
```

## Cobertura de Testes

### Services Testados
- ✅ authService - Registro, login, verificação de token
- ✅ pedidoService - Criação de pedido, validações, workflow de status
- ✅ avaliacaoService - Criação de avaliação, validações, média de restaurante

### Controllers Testados
- ✅ authController - Endpoints de autenticação

### Pontos Críticos Testados
- ✅ Validação de dados de entrada
- ✅ Autenticação e autorização
- ✅ Workflow de status de pedidos
- ✅ Integridade referencial (restaurante aberto, item disponível)
- ✅ Regras de negócio (avaliação apenas após entrega)
- ✅ Tratamento de erros
