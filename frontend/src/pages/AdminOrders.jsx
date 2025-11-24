import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loading from '../components/Loading';
import './AdminOrders.css';

function AdminOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDelivererModal, setShowDelivererModal] = useState(null);
  const [selectedDeliverer, setSelectedDeliverer] = useState('');

  useEffect(() => {
    if (user?.tipo !== 'restaurante') {
      navigate('/');
      return;
    }

    loadOrders();
    loadDeliverers();
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get('/pedidos/restaurante');
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const loadDeliverers = async () => {
    try {
      const response = await api.get('/entregadores');
      setDeliverers(response.data);
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Se o próximo status for "A Caminho", precisa associar entregador
    if (newStatus === 'A Caminho') {
      const onlineDeliverers = deliverers.filter(d => d.status_disponibilidade === 'Disponivel');
      
      if (onlineDeliverers.length === 0) {
        toast.warning('Não há entregadores disponíveis. Cadastre ou coloque um entregador como disponível.');
        return;
      }

      setShowDelivererModal(orderId);
      return;
    }

    try {
      await api.put(`/pedidos/restaurante/${orderId}/status`, { status: newStatus });
      toast.success('Status atualizado com sucesso');
      loadOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleAssignDeliverer = async () => {
    if (!selectedDeliverer) {
      toast.warning('Selecione um entregador');
      return;
    }

    try {
      // Atualizar o pedido com o entregador e status
      await api.put(`/pedidos/restaurante/${showDelivererModal}/entregador`, {
        id_entregador: parseInt(selectedDeliverer)
      });

      await api.put(`/pedidos/restaurante/${showDelivererModal}/status`, { status: 'A Caminho' });
      
      toast.success('Entregador associado e pedido enviado para entrega');
      setShowDelivererModal(null);
      setSelectedDeliverer('');
      loadOrders();
      loadDeliverers();
    } catch (error) {
      console.error('Erro ao associar entregador:', error);
      toast.error('Erro ao associar entregador');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Pendente': 'status-pending',
      'Confirmado': 'status-confirmed',
      'Em Preparo': 'status-preparing',
      'Pronto': 'status-ready',
      'A Caminho': 'status-delivering',
      'Aguardando Confirmação': 'status-waiting-confirmation',
      'Entregue': 'status-delivered',
      'Cancelado': 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const getStatusLabel = (status) => {
    return status;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Pendente': 'Confirmado',
      'Confirmado': 'Em Preparo',
      'Em Preparo': 'Pronto',
      'Pronto': 'A Caminho',
      'A Caminho': 'Entregue', // Restaurant can still force complete if needed, or we can remove this
      'Aguardando Confirmação': 'Entregue'
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    return nextStatus ? getStatusLabel(nextStatus) : null;
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return !['Entregue', 'Cancelado'].includes(order.status);
    }
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pendente: orders.filter((o) => o.status === 'Pendente').length,
    em_preparo: orders.filter((o) => o.status === 'Em Preparo').length,
    pronto: orders.filter((o) => o.status === 'Pronto').length,
    em_entrega: orders.filter((o) => o.status === 'A Caminho').length
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">
        <div className="page-header">
          <div className="page-header-content">
            <h1>Gerenciar Pedidos</h1>
            <p className="subtitle">Acompanhe e atualize o status dos pedidos</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={loadOrders}>
              🔄 Atualizar
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="stats-grid">
          <div className={`stat-card ${filter === 'all' ? 'highlight' : ''}`}>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total de Pedidos</span>
          </div>
          <div className={`stat-card ${filter === 'Pendente' ? 'highlight' : ''}`}>
            <span className="stat-value">{stats.pendente}</span>
            <span className="stat-label">Pendentes</span>
          </div>
          <div className={`stat-card ${filter === 'Em Preparo' ? 'highlight' : ''}`}>
            <span className="stat-value">{stats.em_preparo}</span>
            <span className="stat-label">Em Preparo</span>
          </div>
          <div className={`stat-card ${filter === 'Pronto' ? 'highlight' : ''}`}>
            <span className="stat-value">{stats.pronto}</span>
            <span className="stat-label">Prontos</span>
          </div>
          <div className={`stat-card ${filter === 'A Caminho' ? 'highlight' : ''}`}>
            <span className="stat-value">{stats.em_entrega}</span>
            <span className="stat-label">Em Entrega</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Ativos
          </button>
          <button
            className={`filter-btn ${filter === 'Pendente' ? 'active' : ''}`}
            onClick={() => setFilter('Pendente')}
          >
            Pendentes
          </button>
          <button
            className={`filter-btn ${filter === 'Em Preparo' ? 'active' : ''}`}
            onClick={() => setFilter('Em Preparo')}
          >
            Em Preparo
          </button>
          <button
            className={`filter-btn ${filter === 'Pronto' ? 'active' : ''}`}
            onClick={() => setFilter('Pronto')}
          >
            Prontos
          </button>
          <button
            className={`filter-btn ${filter === 'A Caminho' ? 'active' : ''}`}
            onClick={() => setFilter('A Caminho')}
          >
            Em Entrega
          </button>
          <button
            className={`filter-btn ${filter === 'Entregue' ? 'active' : ''}`}
            onClick={() => setFilter('Entregue')}
          >
            Entregues
          </button>
        </div>

        {/* Lista de Pedidos */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>Nenhum pedido encontrado</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id_pedido} className="order-card">
                <div className="order-card-header">
                  <div className="order-id">
                    <strong>Pedido #{order.id_pedido}</strong>
                    <span className="order-time">
                      {new Date(order.data_hora).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="customer-info">
                    <strong>Cliente:</strong> {order.cliente?.nome}
                    <br />
                    <strong>Telefone:</strong> {order.cliente?.telefone}
                  </div>

                  <div className="order-items">
                    <strong>Itens do Pedido:</strong>
                    <div className="items-list-detailed">
                      {order.itens?.map((item, index) => (
                        <div key={index} className="item-row">
                          <span className="item-qty">{item.quantidade}x</span>
                          <div className="item-details">
                            <span className="item-name">{item.nome_item || item.nome}</span>
                            {item.observacao && <span className="item-note">Obs: {item.observacao}</span>}
                          </div>
                          <span className="item-price">
                            R$ {Number(item.preco_unitario_gravado || item.preco || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.avaliacao && (
                    <div className="order-review">
                      <strong>Avaliação do Cliente:</strong>
                      <div className="review-content">
                        <div className="review-stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`star ${i < order.avaliacao.nota ? 'filled' : ''}`}>★</span>
                          ))}
                        </div>
                        {order.avaliacao.comentario && (
                          <p className="review-comment">"{order.avaliacao.comentario}"</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="order-address">
                    <strong>Endereço:</strong>
                    <p>
                      {order.endereco_entrega?.logradouro}, {order.endereco_entrega?.numero}
                      {order.endereco_entrega?.complemento &&
                        ` - ${order.endereco_entrega.complemento}`}
                    </p>
                    <p>
                      {order.endereco_entrega?.bairro}, {order.endereco_entrega?.cidade}
                    </p>
                  </div>

                  <div className="order-payment">
                    <strong>Pagamento:</strong>{' '}
                    {{
                      'dinheiro': 'Dinheiro',
                      'cartao_credito': 'Cartão de Crédito',
                      'cartao_debito': 'Cartão de Débito',
                      'pix': 'PIX'
                    }[order.metodo_pagamento] || order.metodo_pagamento}
                    {' | '}
                    <strong>Total: R$ {Number(order.valor_total || order.total).toFixed(2)}</strong>
                  </div>
                </div>

                {getNextStatus(order.status) && (
                  <div className="order-card-footer">
                    <button
                      className="btn-primary btn-update-status"
                      onClick={() =>
                        updateOrderStatus(order.id_pedido, getNextStatus(order.status))
                      }
                    >
                      {getNextStatus(order.status) === 'A Caminho' 
                        ? '🚴 Associar Entregador e Enviar'
                        : `Marcar como "${getNextStatusLabel(order.status)}"`
                      }
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal de Seleção de Entregador */}
        {showDelivererModal && (
          <div className="deliverer-modal-overlay">
            <div className="deliverer-modal">
              <div className="modal-header">
                <h3>🚴 Selecionar Entregador</h3>
                <button 
                  className="close-btn" 
                  onClick={() => {
                    setShowDelivererModal(null);
                    setSelectedDeliverer('');
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <p className="modal-description">
                  Escolha um entregador disponível para este pedido:
                </p>

                <div className="deliverer-list">
                  {deliverers
                    .filter(d => d.status_disponibilidade === 'Disponivel')
                    .map(deliverer => (
                      <label 
                        key={deliverer.id_entregador}
                        className={`deliverer-option ${selectedDeliverer == deliverer.id_entregador ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="deliverer"
                          value={deliverer.id_entregador}
                          checked={selectedDeliverer == deliverer.id_entregador}
                          onChange={(e) => setSelectedDeliverer(e.target.value)}
                        />
                        <div className="deliverer-info">
                          <strong>{deliverer.nome}</strong>
                          <small>📱 {deliverer.telefone}</small>
                          <span className="status-badge status-online">Disponível</span>
                        </div>
                      </label>
                    ))}
                </div>

                {deliverers.filter(d => d.status_disponibilidade === 'Disponivel').length === 0 && (
                  <div className="no-deliverers">
                    <p>Nenhum entregador disponível</p>
                    <button 
                      className="btn-secondary"
                      onClick={() => navigate('/admin/deliverers')}
                    >
                      Gerenciar Entregadores
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-primary"
                  onClick={handleAssignDeliverer}
                  disabled={!selectedDeliverer}
                >
                  Confirmar e Enviar para Entrega
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setShowDelivererModal(null);
                    setSelectedDeliverer('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
