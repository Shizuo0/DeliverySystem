import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import Loading from '../components/Loading';
import './OrderDetail.css';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetail();
    
    // Poll para atualização em tempo real a cada 30 segundos
    const interval = setInterval(fetchOrderDetail, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar detalhes do pedido');
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

  const getStatusTimeline = (currentStatus) => {
    const timeline = [
      { key: 'pendente', label: 'Pedido Realizado' },
      { key: 'confirmado', label: 'Confirmado' },
      { key: 'preparando', label: 'Preparando' },
      { key: 'pronto', label: 'Pronto' },
      { key: 'saiu_entrega', label: 'Saiu para Entrega' },
      { key: 'entregue', label: 'Entregue' }
    ];

    const statusOrder = ['pendente', 'confirmado', 'preparando', 'pronto', 'saiu_entrega', 'entregue'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === 'cancelado') {
      return timeline.map((item, index) => ({
        ...item,
        completed: index === 0,
        active: false,
        cancelled: true
      }));
    }

    return timeline.map((item, index) => ({
      ...item,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading message="Carregando detalhes do pedido..." />;
  }

  if (error || !order) {
    return (
      <div className="order-detail-container">
        <div className="error-message">{error || 'Pedido não encontrado'}</div>
        <button className="btn-primary" onClick={() => navigate('/orders')}>
          Voltar para Meus Pedidos
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const timeline = getStatusTimeline(order.status);

  return (
    <div className="order-detail-container">
      <button className="btn-back" onClick={() => navigate('/orders')}>
        ← Voltar
      </button>

      <div className="order-detail-header">
        <div>
          <h1>Pedido #{order.id}</h1>
          <p className="order-detail-date">{formatDate(order.data_pedido)}</p>
        </div>
        <div 
          className="order-detail-status"
          style={{ backgroundColor: statusInfo.color }}
        >
          <span>{statusInfo.icon}</span>
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Timeline de Status */}
      <div className="status-timeline">
        {timeline.map((step, index) => (
          <div 
            key={step.key} 
            className={`timeline-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''} ${step.cancelled ? 'cancelled' : ''}`}
          >
            <div className="timeline-marker">
              {step.completed && !step.cancelled && '✓'}
              {step.active && !step.cancelled && '●'}
              {step.cancelled && '✕'}
            </div>
            <div className="timeline-label">{step.label}</div>
            {index < timeline.length - 1 && <div className="timeline-connector"></div>}
          </div>
        ))}
      </div>

      {order.status === 'cancelado' && (
        <div className="cancel-notice">
          Este pedido foi cancelado
        </div>
      )}

      <div className="order-detail-content">
        {/* Restaurante */}
        <section className="detail-section">
          <h2>Restaurante</h2>
          <div className="restaurant-info">
            <strong>{order.restaurante_nome}</strong>
            {order.restaurante_telefone && (
              <p>📞 {order.restaurante_telefone}</p>
            )}
          </div>
        </section>

        {/* Itens do Pedido */}
        <section className="detail-section">
          <h2>Itens do Pedido</h2>
          <div className="order-items">
            {order.itens && order.itens.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <span className="item-quantity">{item.quantidade}x</span>
                  <span className="item-name">{item.item_nome}</span>
                </div>
                <span className="item-price">
                  R$ {(parseFloat(item.preco_unitario) * item.quantidade).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>R$ {parseFloat(order.valor_total - (order.taxa_entrega || 0)).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Taxa de entrega</span>
              <span>R$ {parseFloat(order.taxa_entrega || 0).toFixed(2)}</span>
            </div>
            <div className="total-row total">
              <strong>Total</strong>
              <strong>R$ {parseFloat(order.valor_total).toFixed(2)}</strong>
            </div>
          </div>
        </section>

        {/* Endereço de Entrega */}
        <section className="detail-section">
          <h2>Endereço de Entrega</h2>
          <div className="address-info">
            <p>
              {order.endereco_logradouro}, {order.endereco_numero}
              {order.endereco_complemento && ` - ${order.endereco_complemento}`}
            </p>
            <p>{order.endereco_bairro}</p>
            <p>{order.endereco_cidade} - {order.endereco_estado}</p>
            <p>CEP: {order.endereco_cep}</p>
          </div>
        </section>

        {/* Forma de Pagamento */}
        <section className="detail-section">
          <h2>Forma de Pagamento</h2>
          <div className="payment-info">
            {order.forma_pagamento === 'dinheiro' && '💵 Dinheiro'}
            {order.forma_pagamento === 'cartao' && '💳 Cartão'}
            {order.forma_pagamento === 'pix' && '🔲 PIX'}
          </div>
        </section>

        {/* Entregador */}
        {order.entregador_nome && (
          <section className="detail-section">
            <h2>Entregador</h2>
            <div className="delivery-info">
              <p><strong>{order.entregador_nome}</strong></p>
              {order.entregador_telefone && (
                <p>📞 {order.entregador_telefone}</p>
              )}
            </div>
          </section>
        )}
      </div>

      {order.status === 'entregue' && (
        <div className="review-section">
          <button 
            className="btn-primary"
            onClick={() => navigate(`/orders/${order.id}/review`)}
          >
            ⭐ Avaliar Pedido
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
