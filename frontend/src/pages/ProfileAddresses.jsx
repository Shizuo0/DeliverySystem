import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import './ProfileAddresses.css';

function ProfileAddresses() {
  const { user } = useAuth();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.logradouro || !formData.numero || !formData.bairro || !formData.cidade || !formData.estado || !formData.cep) {
      toast.warning('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/clientes/enderecos/${editingId}`, formData);
        toast.success('Endereço atualizado com sucesso');
      } else {
        await api.post('/clientes/enderecos', formData);
        toast.success('Endereço cadastrado com sucesso');
      }

      resetForm();
      loadAddresses();
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar endereço');
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
      cep: address.cep,
      nome_identificador: address.nome_identificador || ''
    });
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
        <button className="btn-primary" onClick={() => setShowForm(true)}>
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
                  />
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
                    required
                  />
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
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="numero">Número *</label>
                  <input
                    type="text"
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="123"
                    required
                  />
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
                    required
                  />
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
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="estado">UF *</label>
                  <input
                    type="text"
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    placeholder="SP"
                    maxLength="2"
                    required
                  />
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
