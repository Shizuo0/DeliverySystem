# Deployment Guide - Delivery System Backend

## Requisitos

- Node.js >= 18.x
- MySQL 8.x
- npm >= 9.x

## Configuração de Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=delivery_db
DB_PORT=3306

# JWT
JWT_SECRET=seu_secret_key_aqui_muito_seguro
JWT_EXPIRES_IN=24h

# Servidor
PORT=3000
NODE_ENV=production
```

### 2. Instalação de Dependências

```bash
npm install
```

### 3. Setup do Banco de Dados

```bash
# Criar schema
mysql -u root -p < database/schema.sql

# (Opcional) Popular com dados de teste
mysql -u root -p < database/seed.sql

# Testar conexão
npm run test:db
```

## Instalação de Dependências de Teste

Para rodar os testes, instale as dependências de desenvolvimento:

```bash
npm install --save-dev jest @types/jest supertest
```

## Executar Testes

```bash
# Todos os testes
npm test

# Com watch mode
npm run test:watch

# Com coverage
npm test -- --coverage
```

## Executar em Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## Executar em Produção

```bash
npm start
```

## Verificações de Segurança

### Foreign Keys

O schema MySQL já inclui todas as foreign keys necessárias para integridade referencial:

```sql
-- Exemplo: Pedidos
FOREIGN KEY (id_cliente) REFERENCES Clientes (id_cliente)
FOREIGN KEY (id_restaurante) REFERENCES Restaurantes (id_restaurante)
FOREIGN KEY (id_endereco_cliente) REFERENCES EnderecosClientes (id_endereco_cliente)
```

### Validações

- ✅ Senhas com hash bcrypt (salt rounds: 10)
- ✅ Tokens JWT com expiração de 24h
- ✅ Validação de entrada com express-validator
- ✅ Headers de segurança com Helmet
- ✅ CORS configurado
- ✅ Prepared statements (proteção SQL Injection)

## Monitoramento

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Logs

Os logs são gerenciados por Morgan:
- **Development**: Formato 'dev' (colorido e detalhado)
- **Production**: Formato 'combined' (Apache style)

## Troubleshooting

### Erro de Conexão com Banco

```bash
# Verificar se MySQL está rodando
systemctl status mysql

# Testar conexão
npm run test:db
```

### Erro de Porta em Uso

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Regenerar node_modules

```bash
rm -rf node_modules package-lock.json
npm install
```

## Estrutura de Arquivos

```
backend/
├── __tests__/          # Testes unitários e integração
├── config/             # Configuração do banco de dados
├── controllers/        # Controllers da API
├── docs/               # Documentação
├── middlewares/        # Middlewares (auth, validação, erro)
├── models/             # Models de dados
├── repositories/       # Camada de acesso ao banco
├── routes/             # Definição de rotas
├── services/           # Lógica de negócio
├── validators/         # Validadores de entrada
├── .env                # Variáveis de ambiente
├── package.json        # Dependências
└── server.js           # Ponto de entrada
```

## Backup do Banco de Dados

```bash
# Backup completo
mysqldump -u root -p delivery_db > backup.sql

# Restaurar
mysql -u root -p delivery_db < backup.sql
```

## Performance

### Índices Recomendados

Os índices já estão criados no schema:
- Primary Keys (AUTO_INCREMENT)
- Foreign Keys (índices automáticos)
- UNIQUE constraints (email, telefone)

### Pool de Conexões

Configurado em `config/database.js`:
- waitForConnections: true
- connectionLimit: 10
- queueLimit: 0

## Segurança em Produção

1. **Nunca commitar o arquivo `.env`**
2. **Usar HTTPS em produção**
3. **Configurar CORS para domínios específicos**
4. **Atualizar dependências regularmente**: `npm audit fix`
5. **Limitar rate de requisições** (considere usar `express-rate-limit`)
6. **Monitorar logs de erro**
