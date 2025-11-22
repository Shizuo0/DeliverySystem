import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { formatCPF, formatPhone, removeFormatting, isValidCPF, isValidEmail, isValidPhone } from '../utils/formatters';

function Register() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: ''
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
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter no mínimo 3 caracteres';
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
    
    if (!formData.cpf) {
      errors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(formData.cpf)) {
      errors.cpf = 'CPF inválido';
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
      // Remove formatting before sending to backend
      const dataToSend = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        telefone: removeFormatting(formData.telefone),
        cpf: removeFormatting(formData.cpf)
      };
      
      await api.post('/auth/register', dataToSend);
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
    <div className="register">
      <h1>Criar Conta</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="João Silva"
            disabled={loading}
            className={fieldErrors.nome ? 'input-error' : ''}
          />
          {fieldErrors.nome && <span className="field-error">{fieldErrors.nome}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
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
        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      <p>
        Já tem uma conta? <Link to="/login">Faça login</Link>
      </p>
    </div>
  );
}

export default Register;
