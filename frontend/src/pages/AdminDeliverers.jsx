import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import './AdminDeliverers.css';

function AdminDeliverers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    status_disponibilidade: 'Offline'
  });

  useEffect(() => {
    if (user?.tipo !== 'restaurante') {
      navigate('/');
      return;
    }

    loadDeliverers();
  }, []);

  const loadDeliverers = async () => {
    try {
      const response = await api.get('/entregadores');
      setDeliverers(response.data);
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error);
      toast.error('Erro ao carregar entregadores');
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

    if (!formData.nome || !formData.email || !formData.telefone) {
      toast.warning('Preencha todos os campos obrigatórios');
      return;
    }

    if (!editingId && !formData.senha) {
      toast.warning('A senha é obrigatória para novos entregadores');
      return;
    }

    try {
      const dataToSend = { ...formData };
      if (editingId && !dataToSend.senha) {
        delete dataToSend.senha;
      }

      if (editingId) {
        await api.put(`/entregadores/${editingId}`, dataToSend);
        toast.success('Entregador atualizado com sucesso');
      } else {
        await api.post('/entregadores', dataToSend);
        toast.success('Entregador cadastrado com sucesso');
      }

      resetForm();
      loadDeliverers();
    } catch (error) {
      console.error('Erro ao salvar entregador:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar entregador');
    }
  };

  const handleEdit = (deliverer) => {
    setEditingId(deliverer.id_entregador);
    setFormData({
      nome: deliverer.nome,
      email: deliverer.email,
      senha: '',
      telefone: deliverer.telefone,
      status_disponibilidade: deliverer.status_disponibilidade
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/entregadores/${deleteId}`);
      toast.success('Entregador removido com sucesso');
      setDeleteId(null);
      loadDeliverers();
    } catch (error) {
      console.error('Erro ao deletar entregador:', error);
      toast.error('Erro ao deletar entregador');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/entregadores/${id}/status`, { status: newStatus });
      toast.success('Status atualizado com sucesso');
      loadDeliverers();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      status_disponibilidade: 'Offline'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusClass = (status) => {
    const map = {
      'Online': 'status-online',
      'Offline': 'status-offline',
      'Em Entrega': 'status-delivering'
    };
    return map[status] || '';
  };

  const stats = {
    total: deliverers.length,
    online: deliverers.filter(d => d.status_disponibilidade === 'Online').length,
    delivering: deliverers.filter(d => d.status_disponibilidade === 'Em Entrega').length,
    offline: deliverers.filter(d => d.status_disponibilidade === 'Offline').length
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-deliverers-page">
      <div className="admin-deliverers-container">
        <div className="page-header">
          <div>
            <h1>⚙️ Gerenciar Entregadores</h1>
            <p className="subtitle">Cadastre e gerencie os entregadores do sistema</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            ➕ Novo Entregador
          </button>
        </div>

        {/* Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card highlight-green">
            <span className="stat-value">{stats.online}</span>
            <span className="stat-label">Online</span>
          </div>
          <div className="stat-card highlight-blue">
            <span className="stat-value">{stats.delivering}</span>
            <span className="stat-label">Em Entrega</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.offline}</span>
            <span className="stat-label">Offline</span>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="form-header">
                <h2>{editingId ? 'Editar Entregador' : 'Novo Entregador'}</h2>
                <button className="close-btn" onClick={resetForm}>✕</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="senha">
                    Senha {editingId ? '(deixe em branco para não alterar)' : '*'}
                  </label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    required={!editingId}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefone">Telefone *</label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(11) 98765-4321"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status_disponibilidade">Status</label>
                  <select
                    id="status_disponibilidade"
                    name="status_disponibilidade"
                    value={formData.status_disponibilidade}
                    onChange={handleChange}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Em Entrega">Em Entrega</option>
                  </select>
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

        {/* Lista de Entregadores */}
        <div className="deliverers-grid">
          {deliverers.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum entregador cadastrado</p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                Cadastrar Primeiro Entregador
              </button>
            </div>
          ) : (
            deliverers.map((deliverer) => (
              <div key={deliverer.id_entregador} className="deliverer-card">
                <div className="deliverer-header">
                  <div>
                    <h3>{deliverer.nome}</h3>
                    <p className="deliverer-contact">
                      📧 {deliverer.email}<br />
                      📱 {deliverer.telefone}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusClass(deliverer.status_disponibilidade)}`}>
                    {deliverer.status_disponibilidade}
                  </span>
                </div>

                <div className="deliverer-actions">
                  <select
                    value={deliverer.status_disponibilidade}
                    onChange={(e) => handleStatusUpdate(deliverer.id_entregador, e.target.value)}
                    className="status-select"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Em Entrega">Em Entrega</option>
                  </select>

                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => handleEdit(deliverer)}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="btn-danger btn-sm"
                    onClick={() => setDeleteId(deliverer.id_entregador)}
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
            message="Tem certeza que deseja excluir este entregador?"
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </div>
    </div>
  );
}

export default AdminDeliverers;
