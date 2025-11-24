import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/formatters';
import './Auth.css';

function Login() {
  const [userType, setUserType] = useState('cliente'); // 'cliente' or 'restaurante'
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
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
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const credentials = userType === 'restaurante' 
        ? { email_admin: formData.email, senha_admin: formData.senha }
        : { email: formData.email, senha: formData.senha };

      const result = await login(credentials, userType);
      const type = result?.user?.tipo;

      if (type === 'restaurante') {
        navigate('/admin/restaurant');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login fade-in">
      <div className="login-header">
        <h1>Bem-vindo de volta!</h1>
        <p>Escolha como deseja acessar sua conta</p>
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
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email {userType === 'restaurante' ? 'Administrativo' : ''}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={userType === 'restaurante' ? "admin@restaurante.com" : "seu@email.com"}
            disabled={loading}
            className={fieldErrors.email ? 'input-error' : ''}
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading}
            className={fieldErrors.senha ? 'input-error' : ''}
          />
          {fieldErrors.senha && <span className="field-error">{fieldErrors.senha}</span>}
        </div>
        
        <button type="submit" disabled={loading} className="btn-primary btn-block">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner-small"></span> Entrando...
            </span>
          ) : 'Entrar'}
        </button>
      </form>
      
      <div className="login-footer">
        <p>
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
