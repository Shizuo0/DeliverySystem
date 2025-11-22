import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getClientOrders } from '../services/orderService';
import Loading from '../components/Loading';
import './Orders.css';

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      // Limpar o state da navegação
      window.history.replaceState({}, document.title);
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getClientOrders();
      setOrders(data);
    } catch (err) {
      setError('Erro ao carregar pedidos');
      console.error(err);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toDateString();
    const todayOnly = today.toDateString();
    const yesterdayOnly = yesterday.toDateString();

    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (dateOnly === todayOnly) {
      return `Hoje às ${time}`;
    } else if (dateOnly === yesterdayOnly) {
      return `Ontem às ${time}`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      }) + ` às ${time}`;
    }
  };

  if (loading) {
    return <Loading message="Carregando pedidos..." />;
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Meus Pedidos</h1>
        <p>Acompanhe o status dos seus pedidos</p>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">🛒</div>
          <h2>Nenhum pedido ainda</h2>
          <p>Quando você fizer um pedido, ele aparecerá aqui</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/restaurants')}
          >
            Ver Restaurantes
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div 
                key={order.id} 
                className="order-card"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="order-header">
                  <div className="order-restaurant">
                    <h3>{order.restaurante_nome}</h3>
                    <span className="order-date">
                      {formatDate(order.data_pedido)}
                    </span>
                  </div>
                  <div 
                    className="order-status-badge"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    <span>{statusInfo.icon}</span>
                    <span>{statusInfo.label}</span>
                  </div>
                </div>

                <div className="order-items-summary">
                  {order.itens && order.itens.length > 0 && (
                    <p>
                      {order.itens.length} {order.itens.length === 1 ? 'item' : 'itens'}
                    </p>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <strong>R$ {parseFloat(order.valor_total).toFixed(2)}</strong>
                  </div>
                  <div className="order-payment">
                    <span>
                      {order.forma_pagamento === 'dinheiro' && '💵 Dinheiro'}
                      {order.forma_pagamento === 'cartao' && '💳 Cartão'}
                      {order.forma_pagamento === 'pix' && '🔲 PIX'}
                    </span>
                  </div>
                </div>

                <div className="order-arrow">→</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
