import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getRestaurantById, 
  updateRestaurant, 
  updateRestaurantStatus,
  getRestaurantAddress,
  createRestaurantAddress,
  updateRestaurantAddress
} from '../services/restaurantService';
import { formatPhone, removeFormatting, isValidPhone } from '../utils/formatters';
import Loading from '../components/Loading';
import './AdminRestaurant.css';

function AdminRestaurant() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Restaurant Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    telefone: '',
    tempo_entrega_estimado: '',
    taxa_entrega: ''
  });
  
  // Address State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user?.id_restaurante) {
      fetchData();
    } else if (user && !user.id_restaurante) {
      // If user is loaded but no restaurant ID, stop loading
      setLoading(false);
      setError('ID do restaurante não encontrado no perfil do usuário.');
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restaurantData, addressData] = await Promise.all([
        getRestaurantById(user.id_restaurante),
        getRestaurantAddress().catch(() => null) // Address might not exist yet
      ]);
      
      setRestaurant(restaurantData);
      setFormData({
        nome: restaurantData.nome || '',
        descricao: restaurantData.descricao || '',
        telefone: restaurantData.telefone || '',
        tempo_entrega_estimado: restaurantData.tempo_entrega_estimado || '',
        taxa_entrega: restaurantData.taxa_entrega || ''
      });

      if (addressData) {
        setAddress(addressData);
        setAddressForm({
          logradouro: addressData.logradouro || '',
          numero: addressData.numero || '',
          complemento: addressData.complemento || '',
          bairro: addressData.bairro || '',
          cidade: addressData.cidade || '',
          estado: addressData.estado || '',
          cep: addressData.cep || ''
        });
      }
    } catch (err) {
      setError('Erro ao carregar dados do restaurante');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: value
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!formData.telefone) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!isValidPhone(formData.telefone)) {
      errors.telefone = 'Telefone inválido';
    }

    if (!formData.tempo_entrega_estimado) {
      errors.tempo_entrega_estimado = 'Tempo de entrega é obrigatório';
    } else if (formData.tempo_entrega_estimado < 0) {
      errors.tempo_entrega_estimado = 'Tempo deve ser positivo';
    }

    if (!formData.taxa_entrega) {
      errors.taxa_entrega = 'Taxa de entrega é obrigatória';
    } else if (formData.taxa_entrega < 0) {
      errors.taxa_entrega = 'Taxa deve ser positiva';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
    setFormData({
      nome: restaurant.nome || '',
      descricao: restaurant.descricao || '',
      telefone: formatPhone(restaurant.telefone || ''),
      tempo_entrega_estimado: restaurant.tempo_entrega_estimado || '',
      taxa_entrega: restaurant.taxa_entrega || ''
    });
  };

  const handleEditAddress = () => {
    if (address) {
      setAddressForm({
        logradouro: address.logradouro || '',
        numero: address.numero || '',
        complemento: address.complemento || '',
        bairro: address.bairro || '',
        cidade: address.cidade || '',
        estado: address.estado || '',
        cep: address.cep || ''
      });
    }
    setIsEditingAddress(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    setFieldErrors({});
    setFormData({
      nome: restaurant.nome || '',
      descricao: restaurant.descricao || '',
      telefone: restaurant.telefone || '',
      tempo_entrega_estimado: restaurant.tempo_entrega_estimado || '',
      taxa_entrega: restaurant.taxa_entrega || ''
    });
  };

  const handleCancelAddress = () => {
    setIsEditingAddress(false);
    setError('');
    setSuccess('');
    if (address) {
      setAddressForm({
        logradouro: address.logradouro || '',
        numero: address.numero || '',
        complemento: address.complemento || '',
        bairro: address.bairro || '',
        cidade: address.cidade || '',
        estado: address.estado || '',
        cep: address.cep || ''
      });
    } else {
      setAddressForm({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      });
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const dataToSend = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        telefone: removeFormatting(formData.telefone),
        tempo_entrega_estimado: parseInt(formData.tempo_entrega_estimado),
        taxa_entrega: parseFloat(formData.taxa_entrega)
      };

      const updated = await updateRestaurant(dataToSend);
      setRestaurant(updated.restaurante);
      setSuccess('Informações atualizadas com sucesso!');
      setIsEditing(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar informações');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      let response;
      if (address) {
        response = await updateRestaurantAddress(addressForm);
      } else {
        response = await createRestaurantAddress(addressForm);
      }
      
      // The API returns { message, endereco }
      setAddress(response.endereco);
      setSuccess('Endereço atualizado com sucesso!');
      setIsEditingAddress(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar endereço');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setSaving(true);
      const newStatus = restaurant.status_operacional === 'Aberto' ? 'Fechado' : 'Aberto';
      const response = await updateRestaurantStatus(newStatus);
      // The backend returns { message, restaurante }
      setRestaurant(response.restaurante);
      setSuccess(`Restaurante ${newStatus === 'Aberto' ? 'aberto' : 'fechado'} com sucesso!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Carregando dados do restaurante..." />;
  }

  if (!restaurant) {
    return (
      <div className="admin-restaurant">
        <div className="error">Nenhum restaurante encontrado para este usuário</div>
      </div>
    );
  }

  const isOpen = restaurant.status_operacional === 'Aberto';

  return (
    <div className="admin-restaurant">
      <div className="page-header">
        <h1>Gerenciar Restaurante</h1>
        <div className="header-actions">
          <button 
            onClick={handleToggleStatus}
            disabled={saving}
            className={`btn-toggle-status ${isOpen ? 'open' : 'closed'}`}
          >
            {isOpen ? '🟢 Aberto' : '🔴 Fechado'}
          </button>
          {!isEditing && (
            <button onClick={handleEdit} className="btn-secondary">
              Editar Informações
            </button>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="restaurant-info-card">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor="nome">Nome do Restaurante</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                disabled={saving}
                className={fieldErrors.nome ? 'input-error' : ''}
              />
              {fieldErrors.nome && <span className="field-error">{fieldErrors.nome}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                disabled={saving}
                rows="4"
                placeholder="Descreva seu restaurante..."
              />
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
                disabled={saving}
                className={fieldErrors.telefone ? 'input-error' : ''}
              />
              {fieldErrors.telefone && <span className="field-error">{fieldErrors.telefone}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tempo_entrega_estimado">Tempo de Entrega (min)</label>
                <input
                  type="number"
                  id="tempo_entrega_estimado"
                  name="tempo_entrega_estimado"
                  value={formData.tempo_entrega_estimado}
                  onChange={handleChange}
                  min="0"
                  disabled={saving}
                  className={fieldErrors.tempo_entrega_estimado ? 'input-error' : ''}
                />
                {fieldErrors.tempo_entrega_estimado && (
                  <span className="field-error">{fieldErrors.tempo_entrega_estimado}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="taxa_entrega">Taxa de Entrega (R$)</label>
                <input
                  type="number"
                  id="taxa_entrega"
                  name="taxa_entrega"
                  value={formData.taxa_entrega}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  disabled={saving}
                  className={fieldErrors.taxa_entrega ? 'input-error' : ''}
                />
                {fieldErrors.taxa_entrega && (
                  <span className="field-error">{fieldErrors.taxa_entrega}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button onClick={handleCancel} className="btn-secondary" disabled={saving}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="view-info">
            <div className="info-field">
              <strong>Nome:</strong>
              <span>{restaurant.nome}</span>
            </div>
            <div className="info-field">
              <strong>Descrição:</strong>
              <span>{restaurant.descricao || 'Nenhuma descrição'}</span>
            </div>
            <div className="info-field">
              <strong>Telefone:</strong>
              <span>{formatPhone(restaurant.telefone)}</span>
            </div>
            <div className="info-field">
              <strong>Tempo de Entrega:</strong>
              <span>{restaurant.tempo_entrega_estimado} minutos</span>
            </div>
            <div className="info-field">
              <strong>Taxa de Entrega:</strong>
              <span>R$ {parseFloat(restaurant.taxa_entrega).toFixed(2)}</span>
            </div>
            <div className="info-field">
              <strong>Status:</strong>
              <span className={isOpen ? 'status-open' : 'status-closed'}>
                {isOpen ? 'Aberto' : 'Fechado'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="page-header" style={{ marginTop: '2rem' }}>
        <h2>Endereço</h2>
        {!isEditingAddress && (
          <button onClick={handleEditAddress} className="btn-secondary">
            {address ? 'Editar Endereço' : 'Adicionar Endereço'}
          </button>
        )}
      </div>

      <div className="restaurant-info-card">
        {isEditingAddress ? (
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group" style={{ flex: 3 }}>
                <label htmlFor="logradouro">Logradouro</label>
                <input
                  type="text"
                  id="logradouro"
                  name="logradouro"
                  value={addressForm.logradouro}
                  onChange={handleAddressChange}
                  disabled={saving}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="numero">Número</label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={addressForm.numero}
                  onChange={handleAddressChange}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="complemento">Complemento</label>
              <input
                type="text"
                id="complemento"
                name="complemento"
                value={addressForm.complemento}
                onChange={handleAddressChange}
                disabled={saving}
                placeholder="Apto, Bloco, etc."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bairro">Bairro</label>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={addressForm.bairro}
                  onChange={handleAddressChange}
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cep">CEP</label>
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={addressForm.cep}
                  onChange={handleAddressChange}
                  disabled={saving}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 3 }}>
                <label htmlFor="cidade">Cidade</label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={addressForm.cidade}
                  onChange={handleAddressChange}
                  disabled={saving}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="estado">Estado</label>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  value={addressForm.estado}
                  onChange={handleAddressChange}
                  disabled={saving}
                  maxLength="2"
                  placeholder="UF"
                />
              </div>
            </div>

            <div className="form-actions">
              <button onClick={handleSaveAddress} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Endereço'}
              </button>
              <button onClick={handleCancelAddress} className="btn-secondary" disabled={saving}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="view-info">
            {address ? (
              <>
                <div className="info-field">
                  <strong>Logradouro:</strong>
                  <span>{address.logradouro}, {address.numero}</span>
                </div>
                {address.complemento && (
                  <div className="info-field">
                    <strong>Complemento:</strong>
                    <span>{address.complemento}</span>
                  </div>
                )}
                <div className="info-field">
                  <strong>Bairro:</strong>
                  <span>{address.bairro}</span>
                </div>
                <div className="info-field">
                  <strong>Cidade/UF:</strong>
                  <span>{address.cidade} - {address.estado}</span>
                </div>
                <div className="info-field">
                  <strong>CEP:</strong>
                  <span>{address.cep}</span>
                </div>
              </>
            ) : (
              <div className="empty-message">
                Nenhum endereço cadastrado.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRestaurant;
