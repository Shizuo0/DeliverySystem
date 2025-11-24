import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      const response = await api.get('/pedidos/cliente');
      setOrders(response.data);
    } catch (err) {
      setError('Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) {
      return;
    }

    try {
      await api.put(`/pedidos/cliente/${orderId}/cancelar`);
      toast.success('Pedido cancelado com sucesso');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao cancelar pedido');
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    if (!window.confirm('Confirma que recebeu o pedido?')) {
      return;
    }

    try {
      await api.put(`/pedidos/cliente/${orderId}/entregue`);
      toast.success('Entrega confirmada com sucesso');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao confirmar entrega');
    }
  };

  const normalizeStatus = (status) => {
    if (!status) return '';
    const lower = status.toLowerCase();
    if (lower === 'em preparo') return 'em_preparo';
    if (lower === 'a caminho') return 'em_entrega';
    if (lower === 'aguardando confirmação') return 'aguardando_confirmacao';
    return lower;
  };

  const statusClassMap = {
    pendente: 'status-pending',
    confirmado: 'status-confirmed',
    em_preparo: 'status-preparing',
    pronto: 'status-ready',
    em_entrega: 'status-delivering',
    aguardando_confirmacao: 'status-waiting-confirmation',
    entregue: 'status-delivered',
    cancelado: 'status-cancelled'
  };

  const statusLabelMap = {
    pendente: 'Pendente',
    confirmado: 'Confirmado',
    em_preparo: 'Em preparo',
    pronto: 'Pronto',
    em_entrega: 'Em entrega',
    aguardando_confirmacao: 'Aguardando Confirmação',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
  };

  if (loading) {
    return <Loading message="Carregando pedidos..." />;
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <header className="orders-header">
          <h1>Histórico de pedidos</h1>
          <p>Visualize o status em tempo real e avalie seus pedidos entregues diretamente por aqui.</p>
        </header>

        {error && <div className="error">{error}</div>}

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>Você ainda não fez nenhum pedido.</p>
            <Link to="/" className="btn-primary">Conhecer restaurantes</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const statusKey = normalizeStatus(order.status);
              const total = Number(order.total ?? order.valor_total ?? 0);
              const canReview = statusKey === 'entregue' && !order.avaliacao;
              const canCancel = statusKey === 'pendente';
              // Mostrar botão de confirmar entrega apenas quando estiver "A Caminho" ou "Aguardando Confirmação"
              const canConfirmDelivery = statusKey === 'em_entrega' || statusKey === 'aguardando_confirmacao';

              return (
                <article key={order.id_pedido || order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <p className="order-number">Pedido #{order.id_pedido || order.id}</p>
                      <p className="order-restaurant">{order.restaurante?.nome || 'Restaurante'}</p>
                    </div>
                    <span className={`order-status ${statusClassMap[statusKey] || ''}`}>
                      {statusLabelMap[statusKey] || order.status}
                    </span>
                  </div>

                  <div className="order-card-body">
                    <p className="order-date">
                      {order.data_pedido
                        ? new Date(order.data_pedido).toLocaleString('pt-BR')
                        : 'Data não informada'}
                    </p>
                    <p className="order-total">Total: R$ {total.toFixed(2)}</p>
                    <div className="order-actions">
                      <Link to={`/orders/${order.id_pedido || order.id}`} className="btn-secondary">
                        Ver detalhes
                      </Link>
                      
                      {canCancel && (
                        <button 
                          className="btn-danger-outline"
                          onClick={() => handleCancel(order.id_pedido || order.id)}
                        >
                          Cancelar
                        </button>
                      )}

                      {canConfirmDelivery && (
                        <button 
                          className="btn-success"
                          onClick={() => handleConfirmDelivery(order.id_pedido || order.id)}
                        >
                          Confirmar Entrega
                        </button>
                      )}

                      {canReview && (
                        <Link
                          to={`/orders/${order.id_pedido || order.id}/review`}
                          className="btn-primary"
                        >
                          Avaliar pedido
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
