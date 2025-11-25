/**
 * Utilitários de validação avançada para o sistema de delivery
 * Contém validações específicas para CPF, CNPJ, CEP, telefone, nomes, etc.
 */

// Lista de UFs válidas do Brasil
const ESTADOS_VALIDOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Tipos de cozinha válidos
const TIPOS_COZINHA_VALIDOS = [
  'Brasileira', 'Italiana', 'Japonesa', 'Mexicana', 'Lanches',
  'Pizzaria', 'Doces & Bolos', 'Saudável', 'Outros'
];

// Métodos de pagamento válidos
const METODOS_PAGAMENTO_VALIDOS = [
  'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Vale-Refeição'
];

/**
 * Valida CPF com dígitos verificadores
 * @param {string} cpf - CPF (apenas números ou formatado)
 * @returns {boolean}
 */
const isValidCPF = (cpf) => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  // CPFs com todos os dígitos iguais são inválidos
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;
  
  return true;
};

/**
 * Valida CNPJ com dígitos verificadores
 * @param {string} cnpj - CNPJ (apenas números ou formatado)
 * @returns {boolean}
 */
const isValidCNPJ = (cnpj) => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  
  // CNPJs com todos os dígitos iguais são inválidos
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let length = numbers.length - 2;
  let numbersOnly = numbers.substring(0, length);
  let digits = numbers.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbersOnly.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Validação do segundo dígito verificador
  length = length + 1;
  numbersOnly = numbers.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbersOnly.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

/**
 * Valida se o nome contém apenas caracteres válidos (letras, espaços, acentos)
 * @param {string} nome - Nome a ser validado
 * @returns {boolean}
 */
const isValidNome = (nome) => {
  // Permite letras (incluindo acentuadas), espaços e alguns caracteres especiais como apóstrofo e hífen
  const nomeRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return nomeRegex.test(nome.trim());
};

/**
 * Valida se o nome do restaurante contém apenas caracteres válidos
 * @param {string} nome - Nome do restaurante
 * @returns {boolean}
 */
const isValidNomeRestaurante = (nome) => {
  // Permite letras, números, espaços, acentos e caracteres especiais comuns
  const nomeRegex = /^[a-zA-ZÀ-ÿ0-9\s'&.-]+$/;
  return nomeRegex.test(nome.trim());
};

/**
 * Valida username (letras, números e underscore)
 * @param {string} username - Username a ser validado
 * @returns {boolean}
 */
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

/**
 * Valida email com regex mais rigorosa
 * @param {string} email - Email a ser validado
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.toLowerCase());
};

/**
 * Valida telefone brasileiro (10 ou 11 dígitos)
 * @param {string} telefone - Telefone (apenas números ou formatado)
 * @returns {boolean}
 */
const isValidTelefone = (telefone) => {
  const numbers = telefone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Valida DDD brasileiro
 * @param {string} telefone - Telefone (apenas números)
 * @returns {boolean}
 */
const isValidDDD = (telefone) => {
  const numbers = telefone.replace(/\D/g, '');
  const ddd = parseInt(numbers.substring(0, 2));
  
  // DDDs válidos no Brasil (11 a 99, com exceções)
  const dddsValidos = [
    11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
    21, 22, 24, // RJ
    27, 28, // ES
    31, 32, 33, 34, 35, 37, 38, // MG
    41, 42, 43, 44, 45, 46, // PR
    47, 48, 49, // SC
    51, 53, 54, 55, // RS
    61, // DF
    62, 64, // GO
    63, // TO
    65, 66, // MT
    67, // MS
    68, // AC
    69, // RO
    71, 73, 74, 75, 77, // BA
    79, // SE
    81, 82, 83, 84, 85, 86, 87, 88, 89, // NE
    91, 92, 93, 94, 95, 96, 97, 98, 99 // Norte
  ];
  
  return dddsValidos.includes(ddd);
};

/**
 * Valida CEP brasileiro
 * @param {string} cep - CEP (apenas números ou formatado)
 * @returns {boolean}
 */
const isValidCEP = (cep) => {
  const numbers = cep.replace(/\D/g, '');
  
  if (numbers.length !== 8) return false;
  
  // CEPs não podem começar com 0 ou ter todos os dígitos iguais
  if (numbers.startsWith('00000') || /^(\d)\1{7}$/.test(numbers)) return false;
  
  return true;
};

/**
 * Valida UF brasileira
 * @param {string} estado - UF (2 caracteres)
 * @returns {boolean}
 */
const isValidEstado = (estado) => {
  return ESTADOS_VALIDOS.includes(estado.toUpperCase());
};

/**
 * Valida logradouro (não pode conter apenas números ou caracteres especiais)
 * @param {string} logradouro - Logradouro a ser validado
 * @returns {boolean}
 */
const isValidLogradouro = (logradouro) => {
  // Deve conter pelo menos uma letra
  const hasLetter = /[a-zA-ZÀ-ÿ]/.test(logradouro);
  // Não pode conter caracteres potencialmente perigosos
  const hasDangerousChars = /[<>{}[\]\\]/.test(logradouro);
  
  return hasLetter && !hasDangerousChars;
};

/**
 * Valida número de endereço
 * @param {string} numero - Número do endereço
 * @returns {boolean}
 */
const isValidNumeroEndereco = (numero) => {
  const trimmed = numero.trim().toUpperCase();
  
  // Permite "S/N" ou "SN" para sem número
  if (trimmed === 'S/N' || trimmed === 'SN') return true;
  
  // Permite apenas números, opcionalmente seguidos de uma letra (ex: 123, 45A, 100B)
  const numeroRegex = /^\d+[A-Za-z]?$/;
  return numeroRegex.test(trimmed);
};

/**
 * Valida cidade (não pode conter números)
 * @param {string} cidade - Nome da cidade
 * @returns {boolean}
 */
const isValidCidade = (cidade) => {
  // Permite apenas letras, espaços, acentos, apóstrofo e hífen
  const cidadeRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return cidadeRegex.test(cidade.trim());
};

/**
 * Valida bairro
 * @param {string} bairro - Nome do bairro
 * @returns {boolean}
 */
const isValidBairro = (bairro) => {
  // Permite letras, números, espaços e alguns caracteres especiais
  const bairroRegex = /^[a-zA-ZÀ-ÿ0-9\s'-]+$/;
  return bairroRegex.test(bairro.trim());
};

/**
 * Valida tipo de cozinha
 * @param {string} tipo - Tipo de cozinha
 * @returns {boolean}
 */
const isValidTipoCozinha = (tipo) => {
  return TIPOS_COZINHA_VALIDOS.includes(tipo);
};

/**
 * Valida método de pagamento
 * @param {string} metodo - Método de pagamento
 * @returns {boolean}
 */
const isValidMetodoPagamento = (metodo) => {
  return METODOS_PAGAMENTO_VALIDOS.includes(metodo);
};

/**
 * Valida senha (força mínima)
 * @param {string} senha - Senha a ser validada
 * @returns {{valid: boolean, message: string}}
 */
const validateSenhaStrength = (senha) => {
  if (senha.length < 6) {
    return { valid: false, message: 'Senha deve ter no mínimo 6 caracteres' };
  }
  
  // Verificações opcionais de força
  const hasNumber = /\d/.test(senha);
  const hasLetter = /[a-zA-Z]/.test(senha);
  
  if (!hasLetter) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Valida preço (deve ser positivo e ter no máximo 2 casas decimais)
 * @param {number} preco - Preço a ser validado
 * @returns {boolean}
 */
const isValidPreco = (preco) => {
  if (typeof preco !== 'number' || isNaN(preco)) return false;
  if (preco <= 0) return false;
  
  // Verificar casas decimais
  const decimal = preco.toString().split('.')[1];
  if (decimal && decimal.length > 2) return false;
  
  return true;
};

/**
 * Valida descrição (não pode conter HTML ou scripts)
 * @param {string} descricao - Descrição a ser validada
 * @returns {boolean}
 */
const isValidDescricao = (descricao) => {
  // Não permite tags HTML
  const hasHTML = /<[^>]*>/g.test(descricao);
  // Não permite scripts
  const hasScript = /javascript:|script|onclick|onerror/i.test(descricao);
  
  return !hasHTML && !hasScript;
};

/**
 * Remove formatação e retorna apenas números
 * @param {string} value - Valor formatado
 * @returns {string}
 */
const removeFormatting = (value) => {
  return value ? value.replace(/\D/g, '') : '';
};

/**
 * Sanitiza string removendo caracteres perigosos
 * @param {string} value - String a ser sanitizada
 * @returns {string}
 */
const sanitizeString = (value) => {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '') // Remove tags HTML
    .replace(/[<>{}[\]\\]/g, '') // Remove caracteres perigosos
    .trim();
};

module.exports = {
  ESTADOS_VALIDOS,
  TIPOS_COZINHA_VALIDOS,
  METODOS_PAGAMENTO_VALIDOS,
  isValidCPF,
  isValidCNPJ,
  isValidNome,
  isValidNomeRestaurante,
  isValidUsername,
  isValidEmail,
  isValidTelefone,
  isValidDDD,
  isValidCEP,
  isValidEstado,
  isValidLogradouro,
  isValidNumeroEndereco,
  isValidCidade,
  isValidBairro,
  isValidTipoCozinha,
  isValidMetodoPagamento,
  validateSenhaStrength,
  isValidPreco,
  isValidDescricao,
  removeFormatting,
  sanitizeString
};
