// Format CPF: 000.000.000-00
export const formatCPF = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value;
};

// Format Phone: (00) 00000-0000 or (00) 0000-0000
export const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
  return value;
};

// Format CEP: 00000-000 (limited to 8 digits)
export const formatCEP = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  return numbers.replace(/(\d{5})(\d)/, '$1-$2');
};

// Remove all non-numeric characters
export const removeFormatting = (value) => {
  return value.replace(/\D/g, '');
};

// Validate CPF with check digits
export const isValidCPF = (cpf) => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;
  
  return true;
};

// Validate Email with stricter regex
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.toLowerCase());
};

// Validate Phone (10 or 11 digits)
export const isValidPhone = (phone) => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};

// Validate DDD (Brazilian area code)
export const isValidDDD = (phone) => {
  const numbers = phone.replace(/\D/g, '');
  const ddd = parseInt(numbers.substring(0, 2));
  
  const validDDDs = [
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
  
  return validDDDs.includes(ddd);
};

// Format CNPJ: 00.000.000/0000-00
export const formatCNPJ = (value) => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

// Validate CNPJ with check digits
export const isValidCNPJ = (cnpj) => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  
  // Check for known invalid CNPJs
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Validate first digit
  let length = numbers.length - 2;
  let numbers_only = numbers.substring(0, length);
  let digits = numbers.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers_only.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Validate second digit
  length = length + 1;
  numbers_only = numbers.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers_only.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

// Validate CEP
export const isValidCEP = (cep) => {
  const numbers = cep.replace(/\D/g, '');
  
  if (numbers.length !== 8) return false;
  
  // CEP cannot start with 00000 or be all same digits
  if (numbers.startsWith('00000') || /^(\d)\1{7}$/.test(numbers)) return false;
  
  return true;
};

// Valid Brazilian states
export const ESTADOS_VALIDOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Estados com nome completo para exibição
export const ESTADOS_BRASIL = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
];

// Validate Estado (UF)
export const isValidEstado = (estado) => {
  return ESTADOS_VALIDOS.includes(estado.toUpperCase());
};

// Validate name (only letters, spaces, accents)
export const isValidNome = (nome) => {
  const nomeRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return nomeRegex.test(nome.trim());
};

// Validate restaurant name (allows numbers and some special chars)
export const isValidNomeRestaurante = (nome) => {
  const nomeRegex = /^[a-zA-ZÀ-ÿ0-9\s'&.-]+$/;
  return nomeRegex.test(nome.trim());
};

// Validate username (letters, numbers, underscores only)
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  
  if (!usernameRegex.test(username)) return false;
  if (/^\d/.test(username)) return false; // Cannot start with number
  if (/__/.test(username)) return false; // Cannot have consecutive underscores
  
  return true;
};

// Validate city name (no numbers)
export const isValidCidade = (cidade) => {
  const cidadeRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return cidadeRegex.test(cidade.trim());
};

// Validate bairro (must contain at least one letter, cannot be only numbers)
export const isValidBairro = (bairro) => {
  const trimmed = bairro.trim();
  
  // Regex para caracteres válidos
  const bairroRegex = /^[a-zA-ZÀ-ÿ0-9\s'-]+$/;
  if (!bairroRegex.test(trimmed)) return false;
  
  // Deve conter pelo menos uma letra
  if (!/[a-zA-ZÀ-ÿ]/.test(trimmed)) return false;
  
  // Não pode ser apenas números e espaços
  if (/^[\d\s]+$/.test(trimmed)) return false;
  
  return true;
};

// Validate logradouro (must contain at least one letter, cannot be only numbers)
export const isValidLogradouro = (logradouro) => {
  const trimmed = logradouro.trim();
  
  // Deve conter pelo menos uma letra
  const hasLetter = /[a-zA-ZÀ-ÿ]/.test(trimmed);
  
  // Não pode conter caracteres perigosos
  const hasDangerousChars = /[<>{}[\]\\]/.test(trimmed);
  
  // Não pode ser apenas números e espaços
  const isOnlyNumbers = /^[\d\s]+$/.test(trimmed);
  
  return hasLetter && !hasDangerousChars && !isOnlyNumbers;
};

// Validate numero de endereço (apenas números ou S/N)
export const isValidNumeroEndereco = (numero) => {
  const trimmed = numero.trim().toUpperCase();
  
  // Permite "S/N" ou "SN" para sem número
  if (trimmed === 'S/N' || trimmed === 'SN') return true;
  
  // Permite apenas números, opcionalmente seguidos de uma letra (ex: 123, 45A, 100B)
  const numeroRegex = /^\d+[A-Za-z]?$/;
  return numeroRegex.test(trimmed);
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra');
  }
  
  const commonPasswords = ['123456', 'senha123', 'password', 'qwerty', 'abc123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Esta senha é muito comum. Escolha uma senha mais segura');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Sanitize string (remove dangerous characters)
export const sanitizeString = (value) => {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>{}[\]\\]/g, '') // Remove dangerous chars
    .trim();
};

// Validate and format full name
export const validateFullName = (nome) => {
  const errors = [];
  
  if (!nome || !nome.trim()) {
    errors.push('Nome é obrigatório');
    return { valid: false, errors };
  }
  
  if (!isValidNome(nome)) {
    errors.push('Nome deve conter apenas letras, espaços e acentos');
  }
  
  const parts = nome.trim().split(/\s+/);
  if (parts.length < 2) {
    errors.push('Por favor, informe nome e sobrenome');
  }
  
  if (parts.some(part => part.length < 2)) {
    errors.push('Cada parte do nome deve ter pelo menos 2 caracteres');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Validate complete address
export const validateAddress = (address) => {
  const errors = {};
  
  if (!address.logradouro || !address.logradouro.trim()) {
    errors.logradouro = 'Logradouro é obrigatório';
  } else if (!isValidLogradouro(address.logradouro)) {
    errors.logradouro = 'Logradouro deve conter pelo menos uma letra';
  }
  
  if (!address.numero || !address.numero.trim()) {
    errors.numero = 'Número é obrigatório';
  } else if (!isValidNumeroEndereco(address.numero)) {
    errors.numero = 'Número deve conter apenas dígitos (ex: 123, 45A) ou S/N';
  }
  
  if (!address.bairro || !address.bairro.trim()) {
    errors.bairro = 'Bairro é obrigatório';
  } else if (!isValidBairro(address.bairro)) {
    errors.bairro = 'Bairro contém caracteres inválidos';
  }
  
  if (!address.cidade || !address.cidade.trim()) {
    errors.cidade = 'Cidade é obrigatória';
  } else if (!isValidCidade(address.cidade)) {
    errors.cidade = 'Cidade deve conter apenas letras';
  }
  
  if (!address.estado || !address.estado.trim()) {
    errors.estado = 'Estado é obrigatório';
  } else if (!isValidEstado(address.estado)) {
    errors.estado = 'Estado inválido. Use a sigla de 2 letras (ex: SP, RJ)';
  }
  
  if (!address.cep || !address.cep.trim()) {
    errors.cep = 'CEP é obrigatório';
  } else if (!isValidCEP(address.cep)) {
    errors.cep = 'CEP inválido. Deve conter 8 dígitos';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
