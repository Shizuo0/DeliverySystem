import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  formatPhone,
  removeFormatting,
  isValidPhone,
  isValidDDD,
  isValidEmail,
  isValidNome,
  validatePassword,
  validateFullName
} from '../utils/formatters';
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    status_disponibilidade: 'Indisponivel'
  });

  const [readyOrders, setReadyOrders] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDelivererId, setSelectedDelivererId] = useState(null);

  useEffect(() => {
    if (user?.tipo !== 'restaurante') {
      navigate('/');
      return;
    }

    loadDeliverers();
    // Refresh every 30 seconds
    const interval = setInterval(loadDeliverers, 30000);
    return () => clearInterval(interval);
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

  const loadReadyOrders = async () => {
    try {
      const response = await api.get('/pedidos/restaurante?status=Pronto');
      setReadyOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos prontos:', error);
      toast.error('Erro ao carregar pedidos prontos');
    }
  };

  const handleOpenAssignModal = (delivererId) => {
    setSelectedDelivererId(delivererId);
    setAssignModalOpen(true);
    loadReadyOrders();
  };

  const handleAssignOrder = async (orderId) => {
    if (!orderId) {
      toast.warning('Selecione um pedido');
      return;
    }

    try {
      // 1. Assign deliverer to order
      await api.put(`/pedidos/restaurante/${orderId}/entregador`, {
        id_entregador: selectedDelivererId
      });

      // 2. Update order status to 'A Caminho'
      await api.put(`/pedidos/restaurante/${orderId}/status`, { status: 'A Caminho' });

      toast.success('Pedido atribuído com sucesso');
      setAssignModalOpen(false);
      setSelectedDelivererId(null);
      loadDeliverers();
    } catch (error) {
      console.error('Erro ao atribuir pedido:', error);
      toast.error('Erro ao atribuir pedido');
    }
  };

  const handleCompleteDelivery = async (orderId) => {
    if (!confirm('Confirmar que o pedido foi entregue?')) return;

    try {
      await api.put(`/pedidos/restaurante/${orderId}/status`, { status: 'Entregue' });
      toast.success('Entrega confirmada com sucesso');
      loadDeliverers();
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      toast.error('Erro ao confirmar entrega');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Apply formatting for phone
    if (name === 'telefone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData({ ...formData, [name]: formattedValue });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate nome
    if (!formData.nome || !formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter no mínimo 3 caracteres';
    } else {
      const nameValidation = validateFullName(formData.nome);
      if (!nameValidation.valid) {
        errors.nome = nameValidation.errors[0];
      }
    }
    
    // Validate email
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Formato de email inválido. Use um email válido como exemplo@dominio.com';
    }
    
    // Validate senha (required only for new deliverers)
    if (!editingId) {
      if (!formData.senha) {
        errors.senha = 'Senha é obrigatória para novos entregadores';
      } else {
        const passwordValidation = validatePassword(formData.senha);
        if (!passwordValidation.valid) {
          errors.senha = passwordValidation.errors[0];
        }
      }
    } else if (formData.senha) {
      // If editing and password is provided, validate it
      const passwordValidation = validatePassword(formData.senha);
      if (!passwordValidation.valid) {
        errors.senha = passwordValidation.errors[0];
      }
    }
    
    // Validate telefone
    if (!formData.telefone || !formData.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!isValidPhone(formData.telefone)) {
      errors.telefone = 'Telefone deve conter 10 dígitos (fixo) ou 11 dígitos (celular)';
    } else if (!isValidDDD(formData.telefone)) {
      errors.telefone = 'DDD inválido. Verifique o código de área';
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
      const dataToSend = { 
        ...formData,
        telefone: removeFormatting(formData.telefone)
      };
      
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
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Erro ao salvar entregador';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (deliverer) => {
    setEditingId(deliverer.id_entregador);
    setFormData({
      nome: deliverer.nome,
      email: deliverer.email,
      senha: '',
      telefone: formatPhone(deliverer.telefone || ''),
      status_disponibilidade: deliverer.status_disponibilidade
    });
    setFieldErrors({});
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
      status_disponibilidade: 'Indisponivel'
    });
    setEditingId(null);
    setFieldErrors({});
    setShowForm(false);
  };

  const getStatusClass = (status) => {
    const map = {
      'Disponivel': 'status-online',
      'Online': 'status-online', // Fallback
      'Indisponivel': 'status-offline',
      'Offline': 'status-offline', // Fallback
      'Em Entrega': 'status-delivering'
    };
    return map[status] || '';
  };

  const stats = {
    total: deliverers.length,
    online: deliverers.filter(d => d.status_disponibilidade === 'Disponivel' || d.status_disponibilidade === 'Online').length,
    delivering: deliverers.filter(d => d.status_disponibilidade === 'Em Entrega').length,
    offline: deliverers.filter(d => d.status_disponibilidade === 'Indisponivel' || d.status_disponibilidade === 'Offline').length
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
            <span className="stat-label">Disponíveis</span>
          </div>
          <div className="stat-card highlight-blue">
            <span className="stat-value">{stats.delivering}</span>
            <span className="stat-label">Em Entrega</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.offline}</span>
            <span className="stat-label">Indisponíveis</span>
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
                    placeholder="Nome e Sobrenome"
                    maxLength="255"
                    className={fieldErrors.nome ? 'input-error' : ''}
                  />
                  {fieldErrors.nome && <span className="field-error">{fieldErrors.nome}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="entregador@email.com"
                    className={fieldErrors.email ? 'input-error' : ''}
                  />
                  {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
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
                    placeholder={editingId ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                    className={fieldErrors.senha ? 'input-error' : ''}
                  />
                  {fieldErrors.senha && <span className="field-error">{fieldErrors.senha}</span>}
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
                    maxLength="15"
                    className={fieldErrors.telefone ? 'input-error' : ''}
                  />
                  {fieldErrors.telefone && <span className="field-error">{fieldErrors.telefone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="status_disponibilidade">Status</label>
                  <select
                    id="status_disponibilidade"
                    name="status_disponibilidade"
                    value={formData.status_disponibilidade}
                    onChange={handleChange}
                  >
                    <option value="Disponivel">Disponível</option>
                    <option value="Indisponivel">Indisponível</option>
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

                {/* Active Order Info */}
                {deliverer.active_order_id && (
                  <div className="active-order-info">
                    <h4>📦 Pedido em Andamento</h4>
                    <p><strong>Pedido #{deliverer.active_order_id}</strong></p>
                    <p>Cliente: {deliverer.active_order_client_name}</p>
                    <button 
                      className="btn-success btn-sm full-width"
                      onClick={() => handleCompleteDelivery(deliverer.active_order_id)}
                    >
                      ✅ Confirmar Entrega
                    </button>
                  </div>
                )}

                {/* Assign Button */}
                {(deliverer.status_disponibilidade === 'Disponivel' || deliverer.status_disponibilidade === 'Online') && !deliverer.active_order_id && (
                  <button 
                    className="btn-primary btn-sm full-width mb-3"
                    style={{ marginBottom: '1rem' }}
                    onClick={() => handleOpenAssignModal(deliverer.id_entregador)}
                  >
                    🚴 Atribuir Pedido
                  </button>
                )}

                <div className="deliverer-actions">
                  <select
                    value={deliverer.status_disponibilidade}
                    onChange={(e) => handleStatusUpdate(deliverer.id_entregador, e.target.value)}
                    className="status-select"
                    disabled={!!deliverer.active_order_id}
                  >
                    <option value="Disponivel">Disponível</option>
                    <option value="Indisponivel">Indisponível</option>
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
                    disabled={!!deliverer.active_order_id}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Assign Order Modal */}
        {assignModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Atribuir Pedido</h2>
              <p>Selecione um pedido pronto para entrega:</p>
              
              {readyOrders.length === 0 ? (
                <div className="empty-state-small">
                  <p>Nenhum pedido com status "Pronto" disponível.</p>
                </div>
              ) : (
                <div className="order-selection-list">
                  {readyOrders.map(order => (
                    <div key={order.id_pedido} className="order-selection-item">
                      <div className="order-selection-info">
                        <strong>#{order.id_pedido}</strong> - {order.cliente_nome}
                        <br />
                        <span className="text-muted">
                          {new Date(order.data_pedido).toLocaleTimeString()} - R$ {Number(order.total).toFixed(2)}
                        </span>
                      </div>
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => handleAssignOrder(order.id_pedido)}
                      >
                        Atribuir
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteId && (
          <ConfirmDialog
            isOpen={true}
            title="Confirmar Exclusão"
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
