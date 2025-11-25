import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  formatCPF, 
  formatCNPJ,
  formatPhone, 
  removeFormatting, 
  isValidCPF, 
  isValidCNPJ,
  isValidEmail, 
  isValidPhone 
} from '../utils/formatters';
import './Auth.css';

function Register() {
  const [userType, setUserType] = useState('cliente'); // 'cliente' or 'restaurante'
  const [formData, setFormData] = useState({
    nome: '',
    username: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: '',
    cnpj: '',
    tipo_cozinha: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Apply formatting for CPF and phone
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (name === 'telefone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData({
      ...formData,
      [name]: formattedValue
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nome.trim()) {
      errors.nome = userType === 'restaurante' ? 'Nome do restaurante é obrigatório' : 'Nome completo é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username é obrigatório';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username deve ter no mínimo 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username deve conter apenas letras, números e underscores';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.senha) {
      errors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      errors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    if (!formData.confirmarSenha) {
      errors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'As senhas não coincidem';
    }
    
    if (!formData.telefone) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!isValidPhone(formData.telefone)) {
      errors.telefone = 'Telefone inválido';
    }
    
    if (userType === 'cliente') {
      if (!formData.cpf) {
        errors.cpf = 'CPF é obrigatório';
      } else if (!isValidCPF(formData.cpf)) {
        errors.cpf = 'CPF inválido';
      }
    } else {
      // Restaurant specific validations
      if (!formData.tipo_cozinha) {
        errors.tipo_cozinha = 'Tipo de cozinha é obrigatório';
      }
      if (!formData.cnpj) {
        errors.cnpj = 'CNPJ é obrigatório';
      } else if (!isValidCNPJ(formData.cnpj)) {
        errors.cnpj = 'CNPJ inválido';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let dataToSend;
      let endpoint;

      if (userType === 'cliente') {
        endpoint = '/auth/register';
        dataToSend = {
          nome: formData.nome.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          senha: formData.senha,
          telefone: removeFormatting(formData.telefone),
          cpf: removeFormatting(formData.cpf)
        };
      } else {
        endpoint = '/restaurantes/register';
        dataToSend = {
          nome: formData.nome.trim(),
          username: formData.username.trim(),
          email_admin: formData.email.trim(),
          senha_admin: formData.senha,
          telefone: removeFormatting(formData.telefone),
          tipo_cozinha: formData.tipo_cozinha,
          cnpj: removeFormatting(formData.cnpj)
        };
      }
      
      await api.post(endpoint, dataToSend);
      setSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Erro ao cadastrar. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register fade-in">
      <div className="login-header">
        <h1>Criar Conta</h1>
        <p>Preencha os dados para se cadastrar</p>
      </div>

      <div className="login-tabs">
        <button 
          className={`tab-btn ${userType === 'cliente' ? 'active' : ''}`}
          onClick={() => setUserType('cliente')}
          type="button"
        >
          👤 Cliente
        </button>
        <button 
          className={`tab-btn ${userType === 'restaurante' ? 'active' : ''}`}
          onClick={() => setUserType('restaurante')}
          type="button"
        >
          🏪 Restaurante
        </button>
      </div>

      {error && <div className="error slide-in-right">{error}</div>}
      {success && <div className="success slide-in-right">{success}</div>}
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="nome">{userType === 'restaurante' ? 'Nome do Restaurante' : 'Nome Completo'}</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder={userType === 'restaurante' ? "Restaurante Saboroso" : "João Silva"}
            disabled={loading}
            className={fieldErrors.nome ? 'input-error' : ''}
          />
          {fieldErrors.nome && <span className="field-error">{fieldErrors.nome}</span>}
          <small className="field-hint">{userType === 'restaurante' ? 'Nome oficial do restaurante (não pode ser alterado depois)' : 'Seu nome real completo (não pode ser alterado depois)'}</small>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="seu_username"
            disabled={loading}
            className={fieldErrors.username ? 'input-error' : ''}
          />
          {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          <small className="field-hint">Nome de exibição (pode ser alterado depois)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">{userType === 'restaurante' ? 'Email Administrativo' : 'Email'}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            disabled={loading}
            className={fieldErrors.email ? 'input-error' : ''}
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        {userType === 'cliente' && (
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              maxLength="14"
              disabled={loading}
              className={fieldErrors.cpf ? 'input-error' : ''}
            />
            {fieldErrors.cpf && <span className="field-error">{fieldErrors.cpf}</span>}
          </div>
        )}

        {userType === 'restaurante' && (
          <>
            <div className="form-group">
              <label htmlFor="cnpj">CNPJ</label>
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                maxLength="18"
                disabled={loading}
                className={fieldErrors.cnpj ? 'input-error' : ''}
              />
              {fieldErrors.cnpj && <span className="field-error">{fieldErrors.cnpj}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tipo_cozinha">Tipo de Cozinha</label>
              <select
                id="tipo_cozinha"
                name="tipo_cozinha"
                value={formData.tipo_cozinha}
                onChange={handleChange}
                disabled={loading}
                className={fieldErrors.tipo_cozinha ? 'input-error' : ''}
              >
                <option value="">Selecione...</option>
                <option value="Brasileira">Brasileira</option>
                <option value="Italiana">Italiana</option>
                <option value="Japonesa">Japonesa</option>
                <option value="Mexicana">Mexicana</option>
                <option value="Lanches">Lanches</option>
                <option value="Pizzaria">Pizzaria</option>
                <option value="Doces & Bolos">Doces & Bolos</option>
                <option value="Saudável">Saudável</option>
                <option value="Outros">Outros</option>
              </select>
              {fieldErrors.tipo_cozinha && <span className="field-error">{fieldErrors.tipo_cozinha}</span>}
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            maxLength="15"
            disabled={loading}
            className={fieldErrors.telefone ? 'input-error' : ''}
          />
          {fieldErrors.telefone && <span className="field-error">{fieldErrors.telefone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            disabled={loading}
            className={fieldErrors.senha ? 'input-error' : ''}
          />
          {fieldErrors.senha && <span className="field-error">{fieldErrors.senha}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmarSenha">Confirmar Senha</label>
          <input
            type="password"
            id="confirmarSenha"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            placeholder="Digite a senha novamente"
            disabled={loading}
            className={fieldErrors.confirmarSenha ? 'input-error' : ''}
          />
          {fieldErrors.confirmarSenha && <span className="field-error">{fieldErrors.confirmarSenha}</span>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-block">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner-small"></span> Cadastrando...
            </span>
          ) : 'Cadastrar'}
        </button>
      </form>
      
      <div className="login-footer">
        <p>
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
