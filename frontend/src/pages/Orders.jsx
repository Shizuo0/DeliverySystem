import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/pedidos');
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar pedidos');
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="orders">
      <h1>Meus Pedidos</h1>
      <div className="order-list">
        {orders.length === 0 ? (
          <p>Você ainda não fez nenhum pedido.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>Pedido #{order.id}</h3>
              <p><strong>Data:</strong> {new Date(order.data_pedido).toLocaleString()}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> R$ {order.valor_total}</p>
              <p><strong>Forma de pagamento:</strong> {order.forma_pagamento}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Orders;
