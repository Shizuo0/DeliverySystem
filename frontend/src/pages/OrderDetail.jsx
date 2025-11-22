import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loading from '../components/Loading';
import './OrderDetail.css';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadOrder, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await api.get(`/pedidos/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      toast.error('Erro ao carregar pedido');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!order) {
    return null;
  }

  const getStatusClass = (status) => {
    const statusMap = {
      pendente: 'status-pending',
      confirmado: 'status-confirmed',
      em_preparo: 'status-preparing',
      pronto: 'status-ready',
      em_entrega: 'status-delivering',
      entregue: 'status-delivered',
      cancelado: 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      pendente: 'Pendente',
      confirmado: 'Confirmado',
      em_preparo: 'Em Preparo',
      pronto: 'Pronto',
      em_entrega: 'Em Entrega',
      entregue: 'Entregue',
      cancelado: 'Cancelado'
    };
    return labelMap[status] || status;
  };

  const statusSteps = ['pendente', 'confirmado', 'em_preparo', 'pronto', 'em_entrega', 'entregue'];
  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === 'cancelado';

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-header">
          <button className="btn-back" onClick={() => navigate('/orders')}>
            ← Voltar
          </button>
          <h1>Pedido #{order.id_pedido}</h1>
        </div>

        {/* Status Timeline */}
        {!isCancelled && (
          <div className="status-timeline">
            {statusSteps.map((step, index) => (
              <div
                key={step}
                className={`timeline-step ${
                  index <= currentStepIndex ? 'completed' : ''
                } ${index === currentStepIndex ? 'active' : ''}`}
              >
                <div className="timeline-dot"></div>
                <span className="timeline-label">{getStatusLabel(step)}</span>
              </div>
            ))}
          </div>
        )}

        {isCancelled && (
          <div className="status-cancelled">
            <span className="cancelled-icon">❌</span>
            <h2>Pedido Cancelado</h2>
          </div>
        )}

        <div className="order-content">
          {/* Informações do Restaurante */}
          <section className="order-section">
            <h2>Restaurante</h2>
            <div className="restaurant-card">
              <strong>{order.restaurante?.nome}</strong>
              <p>{order.restaurante?.tipo_cozinha}</p>
              {order.restaurante?.telefone && (
                <p>📞 {order.restaurante.telefone}</p>
              )}
            </div>
          </section>

          {/* Itens do Pedido */}
          <section className="order-section">
            <h2>Itens do Pedido</h2>
            <div className="order-items">
              {order.itens?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-quantity">{item.quantidade}x</span>
                    <span className="item-name">{item.nome_item}</span>
                  </div>
                  <span className="item-price">
                    R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>R$ {(order.total - 5).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Taxa de entrega</span>
                <span>R$ 5.00</span>
              </div>
              <div className="total-row final">
                <strong>Total</strong>
                <strong>R$ {order.total.toFixed(2)}</strong>
              </div>
            </div>
          </section>

          {/* Endereço de Entrega */}
          <section className="order-section">
            <h2>Endereço de Entrega</h2>
            <div className="address-card">
              <p>
                {order.endereco_entrega?.logradouro}, {order.endereco_entrega?.numero}
                {order.endereco_entrega?.complemento && ` - ${order.endereco_entrega.complemento}`}
              </p>
              <p>
                {order.endereco_entrega?.bairro}, {order.endereco_entrega?.cidade} -{' '}
                {order.endereco_entrega?.estado}
              </p>
              <p>CEP: {order.endereco_entrega?.cep}</p>
            </div>
          </section>

          {/* Forma de Pagamento */}
          <section className="order-section">
            <h2>Forma de Pagamento</h2>
            <div className="payment-card">
              {order.forma_pagamento === 'dinheiro' && '💵 Dinheiro'}
              {order.forma_pagamento === 'cartao_credito' && '💳 Cartão de Crédito'}
              {order.forma_pagamento === 'cartao_debito' && '💳 Cartão de Débito'}
              {order.forma_pagamento === 'pix' && '📱 PIX'}
            </div>
          </section>

          {/* Botão de Avaliação */}
          {order.status === 'entregue' && !order.avaliacao && (
            <button
              className="btn-primary btn-review"
              onClick={() => navigate(`/orders/${id}/review`)}
            >
              ⭐ Avaliar Pedido
            </button>
          )}

          {order.avaliacao && (
            <div className="review-completed">
              <span className="check-icon">✅</span>
              <p>Você já avaliou este pedido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
