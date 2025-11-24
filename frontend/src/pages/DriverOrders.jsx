import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loading from '../components/Loading';
import './AdminOrders.css'; // Reusing styles for now

function DriverOrders() {
  const navigate = useNavigate();
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [deliverers, setDeliverers] = useState([]);
  const [selectedDeliverer, setSelectedDeliverer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliverers();
  }, []);

  useEffect(() => {
    if (selectedDeliverer) {
      loadOrders(selectedDeliverer);
      const interval = setInterval(() => loadOrders(selectedDeliverer), 30000);
      return () => clearInterval(interval);
    } else {
      setOrders([]);
    }
  }, [selectedDeliverer]);

  const loadDeliverers = async () => {
    try {
      const response = await api.get('/entregadores');
      setDeliverers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error);
      setLoading(false);
    }
  };

  const loadOrders = async (delivererId) => {
    try {
      const response = await api.get(`/pedidos/entregador/${delivererId}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/pedidos/${orderId}/status-entregador`, { 
        id_entregador: parseInt(selectedDeliverer),
        status: newStatus 
      });
      toast.success('Status atualizado com sucesso');
      loadOrders(selectedDeliverer);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
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

  // Filter only active orders for the driver view usually
  const activeOrders = orders.filter(o => ['A Caminho', 'Aguardando Confirmação'].includes(o.status));
  const historyOrders = orders.filter(o => ['Entregue', 'Cancelado'].includes(o.status));

  if (loading) return <Loading />;

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">
        <div className="page-header">
          <h1>Portal do Entregador</h1>
          <p className="subtitle">Selecione seu perfil para ver suas entregas</p>
        </div>

        <div className="filters" style={{ marginBottom: '20px' }}>
          <select 
            value={selectedDeliverer} 
            onChange={(e) => setSelectedDeliverer(e.target.value)}
            style={{ padding: '10px', fontSize: '16px', width: '100%', maxWidth: '400px' }}
          >
            <option value="">Selecione um entregador...</option>
            {deliverers.map(d => (
              <option key={d.id_entregador} value={d.id_entregador}>
                {d.nome} ({d.status_disponibilidade === 'Online' ? 'Disponivel' : d.status_disponibilidade})
              </option>
            ))}
          </select>
        </div>

        {selectedDeliverer && (
          <>
            <h2>Entregas Ativas</h2>
            <div className="orders-list">
              {activeOrders.length === 0 ? (
                <div className="no-orders"><p>Nenhuma entrega ativa no momento.</p></div>
              ) : (
                activeOrders.map((order) => (
                  <div key={order.id_pedido} className="order-card">
                    <div className="order-card-header">
                      <div className="order-id">
                        <strong>Pedido #{order.id_pedido}</strong>
                      </div>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="order-card-body">
                      <div className="customer-info">
                        <strong>Cliente:</strong> {order.cliente?.nome}
                        <br />
                        <strong>Telefone:</strong> {order.cliente?.telefone}
                      </div>

                      <div className="order-address">
                        <strong>Endereço de Entrega:</strong>
                        <p>
                          {order.endereco_entrega?.logradouro}, {order.endereco_entrega?.numero}
                          {order.endereco_entrega?.complemento && ` - ${order.endereco_entrega.complemento}`}
                        </p>
                        <p>{order.endereco_entrega?.bairro}, {order.endereco_entrega?.cidade}</p>
                      </div>
                      
                      <div className="order-payment">
                        <strong>Pagamento:</strong> {order.metodo_pagamento}
                        <br/>
                        <strong>Valor a cobrar: R$ {Number(order.valor_total).toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="order-card-footer">
                      {order.status === 'A Caminho' && (
                        <button
                          className="btn-primary btn-update-status"
                          onClick={() => updateOrderStatus(order.id_pedido, 'Aguardando Confirmação')}
                        >
                          📍 Marcar como Entregue no Cliente
                        </button>
                      )}
                      {order.status === 'Aguardando Confirmação' && (
                        <div className="waiting-confirmation-msg">
                          <p>Aguardando confirmação do cliente...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <h2 style={{ marginTop: '40px' }}>Histórico Recente</h2>
            <div className="orders-list">
              {historyOrders.slice(0, 5).map((order) => (
                <div key={order.id_pedido} className="order-card" style={{ opacity: 0.7 }}>
                  <div className="order-card-header">
                    <div className="order-id">
                      <strong>Pedido #{order.id_pedido}</strong>
                    </div>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DriverOrders;
