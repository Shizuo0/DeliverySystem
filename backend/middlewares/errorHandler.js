const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erro de validação do MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      error: 'Dados duplicados',
      message: 'Este registro já existe no sistema'
    });
  }

  // Erro de chave estrangeira
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: 'Referência inválida',
      message: 'O registro referenciado não existe'
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado'
    });
  }

  // Erro customizado com mensagem
  if (err.message) {
    return res.status(err.status || 400).json({
      error: err.message
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;
