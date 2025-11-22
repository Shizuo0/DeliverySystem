import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCPF, formatPhone, removeFormatting, isValidPhone } from '../utils/formatters';
import Loading from '../components/Loading';
import api from '../services/api';

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    telefone: user?.telefone || '',
    email: user?.email || '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'telefone') {
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
    
    if (!formData.telefone) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!isValidPhone(formData.telefone)) {
      errors.telefone = 'Telefone inválido';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
    // Format phone for display
    setFormData({
      ...formData,
      telefone: formatPhone(user.telefone || '')
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    setFieldErrors({});
    setFormData({
      nome: user?.nome || '',
      telefone: user?.telefone || '',
      email: user?.email || '',
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const dataToSend = {
        nome: formData.nome.trim(),
        telefone: removeFormatting(formData.telefone),
      };
      
      const response = await api.put('/clientes', dataToSend);
      
      // Update user in context
      updateUser({
        ...user,
        nome: response.data.nome,
        telefone: response.data.telefone,
      });
      
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Erro ao atualizar perfil. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile">
        <Loading message="Carregando perfil..." />
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        {!isEditing && (
          <button onClick={handleEdit} className="btn-secondary">
            Editar Perfil
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="profile-info">
        {isEditing ? (
          <div className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="nome">Nome Completo</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
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
                disabled
                className="input-disabled"
                title="Email não pode ser alterado"
              />
              <small className="field-hint">O email não pode ser alterado</small>
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                maxLength="15"
                disabled={loading}
                className={fieldErrors.telefone ? 'input-error' : ''}
              />
              {fieldErrors.telefone && <span className="field-error">{fieldErrors.telefone}</span>}
            </div>

            <div className="form-group">
              <label>CPF</label>
              <input
                type="text"
                value={formatCPF(user.cpf)}
                disabled
                className="input-disabled"
                title="CPF não pode ser alterado"
              />
              <small className="field-hint">O CPF não pode ser alterado</small>
            </div>

            <div className="profile-actions">
              <button onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button onClick={handleCancel} className="btn-secondary" disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-view">
            <div className="profile-field">
              <strong>Nome:</strong>
              <span>{user.nome}</span>
            </div>
            <div className="profile-field">
              <strong>Email:</strong>
              <span>{user.email}</span>
            </div>
            <div className="profile-field">
              <strong>Telefone:</strong>
              <span>{formatPhone(user.telefone)}</span>
            </div>
            <div className="profile-field">
              <strong>CPF:</strong>
              <span>{formatCPF(user.cpf)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="profile-danger-zone">
        <button onClick={handleLogout} className="btn-danger">
          Sair da Conta
        </button>
      </div>
    </div>
  );
}

export default Profile;
