import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCPF, formatPhone, removeFormatting, isValidPhone, formatCNPJ } from '../utils/formatters';
import Loading from '../components/Loading';
import ProfileAddresses from './ProfileAddresses';
import api from '../services/api';
import './Profile.css';

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const isRestaurante = user?.tipo === 'restaurante';

  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    telefone: user?.telefone || '',
    email: isRestaurante ? (user?.email_admin || '') : (user?.email || ''),
    tipo_cozinha: user?.tipo_cozinha || '',
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

    if (isRestaurante && !formData.tipo_cozinha?.trim()) {
      errors.tipo_cozinha = 'Tipo de cozinha é obrigatório';
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
      email: isRestaurante ? (user?.email_admin || '') : (user?.email || ''),
      tipo_cozinha: user?.tipo_cozinha || '',
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
      let endpoint = '/clientes';
      let dataToSend = {
        nome: formData.nome.trim(),
        telefone: removeFormatting(formData.telefone),
      };

      if (isRestaurante) {
        endpoint = '/restaurantes/perfil';
        dataToSend = {
          nome: formData.nome.trim(),
          telefone: removeFormatting(formData.telefone),
          tipo_cozinha: formData.tipo_cozinha,
        };
      }
      
      const response = await api.put(endpoint, dataToSend);
      
      // Update user in context
      const updatedData = {
        ...user,
        nome: response.data.nome,
        telefone: response.data.telefone,
      };

      if (isRestaurante) {
        updatedData.tipo_cozinha = response.data.tipo_cozinha;
      }

      updateUser(updatedData);
      
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
        <h1>{isRestaurante ? '🏪 Perfil do Restaurante' : '👤 Meu Perfil'}</h1>
      </div>

      {!isRestaurante && (
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Dados Pessoais
          </button>
          <button
            className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Endereços
          </button>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {activeTab === 'profile' && (
        <div className="profile-content">
          {!isEditing && (
            <button onClick={handleEdit} className="btn-secondary edit-profile-btn">
              ✏️ Editar Perfil
            </button>
          )}

          <div className="profile-info">{isEditing ? (
          <div className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="nome">{isRestaurante ? 'Nome do Restaurante' : 'Nome Completo'}</label>
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
              <label htmlFor="email">{isRestaurante ? 'Email Administrativo' : 'Email'}</label>
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

            {isRestaurante ? (
              <>
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
                <div className="form-group">
                  <label>CNPJ</label>
                  <input
                    type="text"
                    value={formatCNPJ(user.cnpj || '')}
                    disabled
                    className="input-disabled"
                    title="CNPJ não pode ser alterado"
                  />
                  <small className="field-hint">O CNPJ não pode ser alterado</small>
                </div>
              </>
            ) : (
              <div className="form-group">
                <label>CPF</label>
                <input
                  type="text"
                  value={formatCPF(user.cpf || '')}
                  disabled
                  className="input-disabled"
                  title="CPF não pode ser alterado"
                />
                <small className="field-hint">O CPF não pode ser alterado</small>
              </div>
            )}

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
              <strong>{isRestaurante ? 'Nome do Restaurante:' : 'Nome:'}</strong>
              <span>{user.nome}</span>
            </div>
            <div className="profile-field">
              <strong>{isRestaurante ? 'Email Administrativo:' : 'Email:'}</strong>
              <span>{isRestaurante ? user.email_admin : user.email}</span>
            </div>
            <div className="profile-field">
              <strong>Telefone:</strong>
              <span>{formatPhone(user.telefone || '')}</span>
            </div>
            {isRestaurante ? (
              <>
                <div className="profile-field">
                  <strong>Tipo de Cozinha:</strong>
                  <span>{user.tipo_cozinha || 'Não informado'}</span>
                </div>
                <div className="profile-field">
                  <strong>CNPJ:</strong>
                  <span>{formatCNPJ(user.cnpj || '')}</span>
                </div>
              </>
            ) : (
              <div className="profile-field">
                <strong>CPF:</strong>
                <span>{formatCPF(user.cpf || '')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="profile-danger-zone">
        <button onClick={handleLogout} className="btn-danger">
          🚪 Sair da Conta
        </button>
      </div>
      </div>
      )}

      {activeTab === 'addresses' && !isRestaurante && (
        <ProfileAddresses />
      )}
    </div>
  );
}

export default Profile;
