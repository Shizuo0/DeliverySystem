const { AppError } = require('../utils/customErrors');

const errorHandler = (err, req, res, next) => {
  // Log do erro para debugging
  console.error('Error:', {
    name: err.name,
    code: err.code,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Erros customizados da aplicação (AppError e subclasses)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      field: err.field || undefined
    });
  }

  // Erro de validação do MySQL - Entrada duplicada
  if (err.code === 'ER_DUP_ENTRY') {
    // Extrair campo duplicado da mensagem de erro
    const match = err.message.match(/Duplicate entry '(.+)' for key '(.+)'/);
    let field = 'campo';
    let value = '';
    
    if (match) {
      value = match[1];
      const keyName = match[2].toLowerCase();
      
      // Mapeamento de nomes de índices para nomes amigáveis
      if (keyName.includes('email')) {
        field = 'Email';
      } else if (keyName.includes('username')) {
        field = 'Username';
      } else if (keyName.includes('cpf')) {
        field = 'CPF';
      } else if (keyName.includes('cnpj')) {
        field = 'CNPJ';
      } else if (keyName.includes('telefone')) {
        field = 'Telefone';
      }
    }
    
    return res.status(409).json({
      error: `${field} já está cadastrado no sistema`,
      code: 'DUPLICATE_ENTRY',
      field: field.toLowerCase()
    });
  }

  // Erro de violação de chave estrangeira
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: 'Referência inválida. O registro relacionado não existe.',
      code: 'FOREIGN_KEY_VIOLATION'
    });
  }

  // Erro de restrição de chave estrangeira (tentativa de deletar registro referenciado)
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      error: 'Este registro não pode ser excluído pois está sendo utilizado em outros cadastros.',
      code: 'REFERENCE_CONSTRAINT'
    });
  }

  // Erro de dado muito longo para coluna
  if (err.code === 'ER_DATA_TOO_LONG') {
    const match = err.message.match(/Data too long for column '(.+)'/);
    const field = match ? match[1] : 'campo';
    
    return res.status(400).json({
      error: `O valor informado para ${field} é muito longo`,
      code: 'DATA_TOO_LONG',
      field
    });
  }

  // Erro de tipo de dado incorreto
  if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
    return res.status(400).json({
      error: 'Tipo de dado inválido para um dos campos',
      code: 'INVALID_DATA_TYPE'
    });
  }

  // Erro de conexão com banco de dados
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      error: 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.',
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }

  // Erro de timeout
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(504).json({
      error: 'A requisição demorou muito para ser processada. Tente novamente.',
      code: 'TIMEOUT_ERROR'
    });
  }

  // Erro de JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token de autenticação inválido. Faça login novamente.',
      code: 'INVALID_TOKEN'
    });
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Sua sessão expirou. Faça login novamente.',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Erro de validação do express-validator
  if (err.array && typeof err.array === 'function') {
    const errors = err.array();
    return res.status(400).json({
      error: 'Erro de validação',
      code: 'VALIDATION_ERROR',
      details: errors.map(e => ({
        field: e.path || e.param,
        message: e.msg
      }))
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido na requisição',
      code: 'INVALID_JSON'
    });
  }

  // Erro com mensagem customizada (erros lançados manualmente com throw new Error)
  if (err.message && !err.isOperational) {
    // Lista de mensagens conhecidas que devem ser retornadas ao usuário
    const knownErrors = [
      'Cliente não encontrado',
      'Restaurante não encontrado',
      'Entregador não encontrado',
      'Pedido não encontrado',
      'Endereço não encontrado',
      'Item não encontrado',
      'Categoria não encontrada',
      'Email já está em uso',
      'Username já está em uso',
      'Telefone já está em uso',
      'CPF já está em uso',
      'CNPJ já está em uso',
      'Senha atual incorreta',
      'Credenciais inválidas',
      'Status inválido',
      'Erro ao atualizar',
      'Erro ao deletar'
    ];

    const isKnownError = knownErrors.some(known => 
      err.message.toLowerCase().includes(known.toLowerCase())
    );

    if (isKnownError) {
      return res.status(err.status || 400).json({
        error: err.message,
        code: 'BUSINESS_ERROR'
      });
    }
  }

  // Erro genérico (não expor detalhes em produção)
  res.status(500).json({
    error: 'Erro interno do servidor. Por favor, tente novamente mais tarde.',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        message: err.message,
        stack: err.stack
      }
    })
  });
};

module.exports = errorHandler;
