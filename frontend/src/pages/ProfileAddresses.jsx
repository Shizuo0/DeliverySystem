import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  formatCEP, 
  removeFormatting,
  isValidCEP,
  isValidEstado,
  isValidCidade,
  isValidBairro,
  isValidLogradouro,
  isValidNumeroEndereco,
  validateAddress,
  ESTADOS_BRASIL
} from '../utils/formatters';
import './ProfileAddresses.css';

function ProfileAddresses() {
  const { user } = useAuth();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    nome_identificador: ''
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await api.get('/clientes/enderecos');
      const addressesData = response.data.data || [];
      setAddresses(Array.isArray(addressesData) ? addressesData : []);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Apply formatting
    if (name === 'cep') {
      formattedValue = formatCEP(value);
    }
    // Estado agora é um select, não precisa de formatação
    
    setFormData({ ...formData, [name]: formattedValue });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate nome_identificador (opcional, mas se preenchido deve conter letras)
    if (formData.nome_identificador && formData.nome_identificador.trim()) {
      const nome = formData.nome_identificador.trim();
      // Não pode ser apenas números
      if (/^[\d\s]+$/.test(nome)) {
        errors.nome_identificador = 'Nome deve conter letras (ex: Casa, Trabalho, Apartamento)';
      } else if (!/[a-zA-ZÀ-ÿ]/.test(nome)) {
        errors.nome_identificador = 'Nome deve conter pelo menos uma letra';
      } else if (/[<>{}[\]\\]/.test(nome)) {
        errors.nome_identificador = 'Nome contém caracteres não permitidos';
      }
    }
    
    // Validate logradouro
    if (!formData.logradouro || !formData.logradouro.trim()) {
      errors.logradouro = 'Logradouro é obrigatório';
    } else if (formData.logradouro.trim().length < 3) {
      errors.logradouro = 'Logradouro deve ter no mínimo 3 caracteres';
    } else if (!isValidLogradouro(formData.logradouro)) {
      errors.logradouro = 'Logradouro deve conter letras (ex: Rua das Flores, Av. Brasil)';
    }
    
    // Validate numero
    if (!formData.numero || !formData.numero.trim()) {
      errors.numero = 'Número é obrigatório';
    } else if (!isValidNumeroEndereco(formData.numero)) {
      errors.numero = 'Número deve conter apenas dígitos (ex: 123, 45A) ou S/N';
    }
    
    // Validate bairro
    if (!formData.bairro || !formData.bairro.trim()) {
      errors.bairro = 'Bairro é obrigatório';
    } else if (formData.bairro.trim().length < 2) {
      errors.bairro = 'Bairro deve ter no mínimo 2 caracteres';
    } else if (!isValidBairro(formData.bairro)) {
      errors.bairro = 'Bairro deve conter letras (ex: Centro, Jardim América)';
    }
    
    // Validate cidade
    if (!formData.cidade || !formData.cidade.trim()) {
      errors.cidade = 'Cidade é obrigatória';
    } else if (formData.cidade.trim().length < 2) {
      errors.cidade = 'Cidade deve ter no mínimo 2 caracteres';
    } else if (!isValidCidade(formData.cidade)) {
      errors.cidade = 'Cidade deve conter apenas letras, espaços e acentos';
    }
    
    // Validate estado
    if (!formData.estado || !formData.estado.trim()) {
      errors.estado = 'Estado é obrigatório';
    } else if (!isValidEstado(formData.estado)) {
      errors.estado = 'Estado inválido. Use uma sigla válida (ex: SP, RJ, MG)';
    }
    
    // Validate CEP
    if (!formData.cep || !formData.cep.trim()) {
      errors.cep = 'CEP é obrigatório';
    } else {
      const cepNumbers = removeFormatting(formData.cep);
      if (cepNumbers.length !== 8) {
        errors.cep = 'CEP deve conter exatamente 8 dígitos';
      } else if (!isValidCEP(formData.cep)) {
        errors.cep = 'CEP inválido. Verifique o número e tente novamente';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      // Prepare data with formatted CEP (numbers only)
      const dataToSend = {
        ...formData,
        cep: removeFormatting(formData.cep),
        estado: formData.estado.toUpperCase()
      };
      
      if (editingId) {
        await api.put(`/clientes/enderecos/${editingId}`, dataToSend);
        toast.success('Endereço atualizado com sucesso');
      } else {
        await api.post('/clientes/enderecos', dataToSend);
        toast.success('Endereço cadastrado com sucesso');
      }

      resetForm();
      loadAddresses();
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Erro ao salvar endereço';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.id_endereco_cliente);
    setFormData({
      logradouro: address.logradouro,
      numero: address.numero,
      complemento: address.complemento || '',
      bairro: address.bairro,
      cidade: address.cidade,
      estado: address.estado,
      cep: formatCEP(address.cep || ''),
      nome_identificador: address.nome_identificador || ''
    });
    setFieldErrors({});
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/clientes/enderecos/${deleteId}`);
      toast.success('Endereço removido com sucesso');
      setDeleteId(null);
      loadAddresses();
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      toast.error('Erro ao deletar endereço');
    }
  };

  const resetForm = () => {
    setFormData({
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      nome_identificador: ''
    });
    setEditingId(null);
    setFieldErrors({});
    setShowForm(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="profile-addresses-section">
      <div className="section-header">
        <div>
          <h2>📍 Meus Endereços</h2>
          <p>Gerencie seus endereços de entrega</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setFieldErrors({}); }}>
          ➕ Novo Endereço
        </button>
      </div>

      {showForm && (
        <div className="address-form-overlay">
          <div className="address-form-modal">
            <div className="form-header">
              <h3>{editingId ? 'Editar Endereço' : 'Novo Endereço'}</h3>
              <button className="close-btn" onClick={resetForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome_identificador">Nome (ex: Casa, Trabalho)</label>
                  <input
                    type="text"
                    id="nome_identificador"
                    name="nome_identificador"
                    value={formData.nome_identificador}
                    onChange={handleChange}
                    placeholder="Casa"
                    maxLength="45"
                    className={fieldErrors.nome_identificador ? 'input-error' : ''}
                  />
                  {fieldErrors.nome_identificador && <span className="field-error">{fieldErrors.nome_identificador}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="cep">CEP *</label>
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="12345-678"
                    maxLength="9"
                    className={fieldErrors.cep ? 'input-error' : ''}
                  />
                  {fieldErrors.cep && <span className="field-error">{fieldErrors.cep}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label htmlFor="logradouro">Logradouro *</label>
                  <input
                    type="text"
                    id="logradouro"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleChange}
                    placeholder="Rua, Avenida..."
                    maxLength="255"
                    className={fieldErrors.logradouro ? 'input-error' : ''}
                  />
                  {fieldErrors.logradouro && <span className="field-error">{fieldErrors.logradouro}</span>}
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="numero">Número *</label>
                  <input
                    type="text"
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="123 ou S/N"
                    maxLength="10"
                    className={fieldErrors.numero ? 'input-error' : ''}
                  />
                  {fieldErrors.numero && <span className="field-error">{fieldErrors.numero}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="complemento">Complemento</label>
                <input
                  type="text"
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Apto, Bloco, etc."
                  maxLength="100"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label htmlFor="bairro">Bairro *</label>
                  <input
                    type="text"
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    placeholder="Centro"
                    maxLength="100"
                    className={fieldErrors.bairro ? 'input-error' : ''}
                  />
                  {fieldErrors.bairro && <span className="field-error">{fieldErrors.bairro}</span>}
                </div>

                <div className="form-group flex-2">
                  <label htmlFor="cidade">Cidade *</label>
                  <input
                    type="text"
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="São Paulo"
                    maxLength="100"
                    className={fieldErrors.cidade ? 'input-error' : ''}
                  />
                  {fieldErrors.cidade && <span className="field-error">{fieldErrors.cidade}</span>}
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="estado">UF *</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className={fieldErrors.estado ? 'input-error' : ''}
                  >
                    <option value="">Selecione o estado</option>
                    {ESTADOS_BRASIL.map(estado => (
                      <option key={estado.uf} value={estado.uf}>
                        {estado.uf} - {estado.nome}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.estado && <span className="field-error">{fieldErrors.estado}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="addresses-grid">
        {addresses.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não cadastrou nenhum endereço</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Cadastrar Primeiro Endereço
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id_endereco_cliente} className="address-card">
              <div className="address-header">
                <h4>
                  📍 {address.nome_identificador || 'Endereço'}
                </h4>
              </div>

              <div className="address-details">
                <p>{address.logradouro}, {address.numero}</p>
                {address.complemento && <p>{address.complemento}</p>}
                <p>{address.bairro}, {address.cidade} - {address.estado}</p>
                <p>CEP: {address.cep}</p>
              </div>

              <div className="address-actions">
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleEdit(address)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn-danger btn-sm"
                  onClick={() => setDeleteId(address.id_endereco_cliente)}
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteId && (
        <ConfirmDialog
          isOpen={!!deleteId}
          title="Excluir Endereço"
          message="Tem certeza que deseja excluir este endereço?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

export default ProfileAddresses;
