import { useState, useEffect } from 'react';
import { getRestaurantOrders, updateOrderStatus } from '../services/orderService';
import Loading from '../components/Loading';
import './AdminOrders.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active'); // active, all
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    
    // Poll para atualização em tempo real a cada 30 segundos
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getRestaurantOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      await updateOrderStatus(orderId, newStatus);
      
      // Atualizar localmente
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      setError('Erro ao atualizar status do pedido');
      console.error(err);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pendente: { label: 'Pendente', color: '#FFA726', icon: '⏳' },
      confirmado: { label: 'Confirmado', color: '#42A5F5', icon: '✓' },
      preparando: { label: 'Preparando', color: '#7E57C2', icon: '👨‍🍳' },
      pronto: { label: 'Pronto', color: '#66BB6A', icon: '✓✓' },
      saiu_entrega: { label: 'Saiu para Entrega', color: '#29B6F6', icon: '🚚' },
      entregue: { label: 'Entregue', color: '#26A69A', icon: '✓✓✓' },
      cancelado: { label: 'Cancelado', color: '#EF5350', icon: '✕' }
    };
    return statusMap[status] || { label: status, color: '#9E9E9E', icon: '?' };
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pendente: 'confirmado',
      confirmado: 'preparando',
      preparando: 'pronto',
      pronto: 'saiu_entrega'
    };
    return statusFlow[currentStatus];
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmado: 'Confirmar',
      preparando: 'Iniciar Preparo',
      pronto: 'Marcar como Pronto',
      saiu_entrega: 'Saiu para Entrega'
    };
    return labels[status] || 'Avançar';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return !['entregue', 'cancelado'].includes(order.status);
    }
    return true;
  });

  const activeOrders = orders.filter(o => !['entregue', 'cancelado'].includes(o.status));
  const completedOrders = orders.filter(o => ['entregue', 'cancelado'].includes(o.status));

  if (loading) {
    return <Loading message="Carregando pedidos..." />;
  }

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <div>
          <h1>Gerenciar Pedidos</h1>
          <p>Acompanhe e atualize o status dos pedidos</p>
        </div>
        <div className="orders-stats">
          <div className="stat-card active">
            <span className="stat-number">{activeOrders.length}</span>
            <span className="stat-label">Ativos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{completedOrders.length}</span>
            <span className="stat-label">Finalizados</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Pedidos Ativos ({activeOrders.length})
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos os Pedidos ({orders.length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📋</div>
          <h2>Nenhum pedido</h2>
          <p>
            {filter === 'active' 
              ? 'Não há pedidos ativos no momento' 
              : 'Não há pedidos registrados'}
          </p>
        </div>
      ) : (
        <div className="admin-orders-grid">
          {filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            const nextStatus = getNextStatus(order.status);
            const isUpdating = updatingOrder === order.id;

            return (
              <div key={order.id} className="admin-order-card">
                <div className="order-card-header">
                  <div>
                    <h3>Pedido #{order.id}</h3>
                    <span className="order-time">{formatDate(order.data_pedido)}</span>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    <span>{statusInfo.icon}</span>
                    <span>{statusInfo.label}</span>
                  </div>
                </div>

                <div className="order-customer">
                  <strong>Cliente:</strong> {order.cliente_nome}
                </div>

                <div className="order-items-list">
                  <strong>Itens:</strong>
                  {order.itens && order.itens.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <span>{item.quantidade}x {item.item_nome}</span>
                    </div>
                  ))}
                </div>

                <div className="order-address">
                  <strong>Endereço:</strong>
                  <p>
                    {order.endereco_logradouro}, {order.endereco_numero}
                    {order.endereco_complemento && ` - ${order.endereco_complemento}`}
                  </p>
                  <p>{order.endereco_bairro}</p>
                </div>

                <div className="order-payment">
                  <strong>Pagamento:</strong>
                  <span>
                    {order.forma_pagamento === 'dinheiro' && '💵 Dinheiro'}
                    {order.forma_pagamento === 'cartao' && '💳 Cartão'}
                    {order.forma_pagamento === 'pix' && '🔲 PIX'}
                  </span>
                </div>

                <div className="order-total">
                  <strong>Total:</strong>
                  <span className="total-value">R$ {parseFloat(order.valor_total).toFixed(2)}</span>
                </div>

                {nextStatus && (
                  <button
                    className="btn-update-status"
                    onClick={() => handleUpdateStatus(order.id, nextStatus)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Atualizando...' : getStatusLabel(nextStatus)}
                  </button>
                )}

                {order.status === 'pendente' && (
                  <button
                    className="btn-cancel"
                    onClick={() => handleUpdateStatus(order.id, 'cancelado')}
                    disabled={isUpdating}
                  >
                    Cancelar Pedido
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
