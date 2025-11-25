/**
 * Classes de erro customizadas para tratamento específico de exceções
 */

// Erro base da aplicação
class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erro de validação
class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

// Erro de campo obrigatório
class RequiredFieldError extends ValidationError {
  constructor(fieldName) {
    super(`O campo ${fieldName} é obrigatório`, fieldName);
    this.code = 'REQUIRED_FIELD';
  }
}

// Erro de formato inválido
class InvalidFormatError extends ValidationError {
  constructor(fieldName, expectedFormat) {
    super(`${fieldName} está em formato inválido. ${expectedFormat}`, fieldName);
    this.code = 'INVALID_FORMAT';
  }
}

// Erro de valor inválido
class InvalidValueError extends ValidationError {
  constructor(fieldName, reason) {
    super(`${fieldName} possui valor inválido: ${reason}`, fieldName);
    this.code = 'INVALID_VALUE';
  }
}

// Erro de duplicação
class DuplicateError extends AppError {
  constructor(field, value = null) {
    const message = value 
      ? `${field} '${value}' já está em uso`
      : `${field} já está em uso`;
    super(message, 409, 'DUPLICATE_ERROR');
    this.field = field;
  }
}

// Erro de autenticação
class AuthenticationError extends AppError {
  constructor(message = 'Credenciais inválidas') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// Erro de autorização
class AuthorizationError extends AppError {
  constructor(message = 'Acesso não autorizado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// Erro de recurso não encontrado
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

// Erro de conflito de estado
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

// Erro de operação não permitida
class ForbiddenOperationError extends AppError {
  constructor(message) {
    super(message, 403, 'FORBIDDEN_OPERATION');
  }
}

// Erro de limite excedido
class LimitExceededError extends AppError {
  constructor(limit, resource = 'itens') {
    super(`Limite máximo de ${limit} ${resource} excedido`, 400, 'LIMIT_EXCEEDED');
    this.limit = limit;
  }
}

// Erro de CPF inválido
class InvalidCPFError extends ValidationError {
  constructor() {
    super('CPF inválido. Verifique os dígitos e tente novamente.', 'cpf');
    this.code = 'INVALID_CPF';
  }
}

// Erro de CNPJ inválido
class InvalidCNPJError extends ValidationError {
  constructor() {
    super('CNPJ inválido. Verifique os dígitos e tente novamente.', 'cnpj');
    this.code = 'INVALID_CNPJ';
  }
}

// Erro de CEP inválido
class InvalidCEPError extends ValidationError {
  constructor() {
    super('CEP inválido. Use o formato XXXXX-XXX com 8 dígitos.', 'cep');
    this.code = 'INVALID_CEP';
  }
}

// Erro de telefone inválido
class InvalidPhoneError extends ValidationError {
  constructor(reason = 'Telefone deve conter 10 ou 11 dígitos') {
    super(reason, 'telefone');
    this.code = 'INVALID_PHONE';
  }
}

// Erro de email inválido
class InvalidEmailError extends ValidationError {
  constructor() {
    super('Formato de email inválido. Use um email válido como exemplo@dominio.com', 'email');
    this.code = 'INVALID_EMAIL';
  }
}

// Erro de estado inválido
class InvalidEstadoError extends ValidationError {
  constructor() {
    super('Estado (UF) inválido. Use uma sigla válida como SP, RJ, MG, etc.', 'estado');
    this.code = 'INVALID_ESTADO';
  }
}

// Erro de senha fraca
class WeakPasswordError extends ValidationError {
  constructor(reason) {
    super(reason || 'Senha muito fraca. Use pelo menos 6 caracteres com letras e números.', 'senha');
    this.code = 'WEAK_PASSWORD';
  }
}

// Erro de nome inválido
class InvalidNameError extends ValidationError {
  constructor(field = 'nome') {
    super(`${field} contém caracteres inválidos. Use apenas letras, espaços e acentos.`, field);
    this.code = 'INVALID_NAME';
  }
}

// Erro de endereço inválido
class InvalidAddressError extends ValidationError {
  constructor(field, reason) {
    super(`${field} inválido: ${reason}`, field);
    this.code = 'INVALID_ADDRESS';
  }
}

// Erro de pedido
class OrderError extends AppError {
  constructor(message) {
    super(message, 400, 'ORDER_ERROR');
  }
}

// Erro de restaurante fechado
class RestaurantClosedError extends AppError {
  constructor() {
    super('Restaurante está fechado no momento', 400, 'RESTAURANT_CLOSED');
  }
}

// Erro de item indisponível
class ItemUnavailableError extends AppError {
  constructor(itemName = 'Item') {
    super(`${itemName} não está disponível no momento`, 400, 'ITEM_UNAVAILABLE');
  }
}

module.exports = {
  AppError,
  ValidationError,
  RequiredFieldError,
  InvalidFormatError,
  InvalidValueError,
  DuplicateError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ForbiddenOperationError,
  LimitExceededError,
  InvalidCPFError,
  InvalidCNPJError,
  InvalidCEPError,
  InvalidPhoneError,
  InvalidEmailError,
  InvalidEstadoError,
  WeakPasswordError,
  InvalidNameError,
  InvalidAddressError,
  OrderError,
  RestaurantClosedError,
  ItemUnavailableError
};
