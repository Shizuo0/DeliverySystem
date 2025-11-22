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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.tipo !== 'restaurante') {
      navigate('/');
      return;
    }

    loadOrders();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get('/restaurantes/pedidos');
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/pedidos/${orderId}/status`, { status: newStatus });
      toast.success('Status atualizado com sucesso');
      loadOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pendente: 'confirmado',
      confirmado: 'em_preparo',
      em_preparo: 'pronto',
      pronto: 'em_entrega',
      em_entrega: 'entregue'
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
      return !['entregue', 'cancelado'].includes(order.status);
    }
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pendente: orders.filter((o) => o.status === 'pendente').length,
    em_preparo: orders.filter((o) => o.status === 'em_preparo').length,
    pronto: orders.filter((o) => o.status === 'pronto').length,
    em_entrega: orders.filter((o) => o.status === 'em_entrega').length
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">
        <div className="page-header">
          <h1>Gerenciar Pedidos</h1>
          <p className="subtitle">Acompanhe e atualize o status dos pedidos</p>
        </div>

        {/* Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total de Pedidos</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-value">{stats.pendente}</span>
            <span className="stat-label">Pendentes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.em_preparo}</span>
            <span className="stat-label">Em Preparo</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.pronto}</span>
            <span className="stat-label">Prontos</span>
          </div>
          <div className="stat-card">
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
            className={`filter-btn ${filter === 'pendente' ? 'active' : ''}`}
            onClick={() => setFilter('pendente')}
          >
            Pendentes
          </button>
          <button
            className={`filter-btn ${filter === 'em_preparo' ? 'active' : ''}`}
            onClick={() => setFilter('em_preparo')}
          >
            Em Preparo
          </button>
          <button
            className={`filter-btn ${filter === 'pronto' ? 'active' : ''}`}
            onClick={() => setFilter('pronto')}
          >
            Prontos
          </button>
          <button
            className={`filter-btn ${filter === 'entregue' ? 'active' : ''}`}
            onClick={() => setFilter('entregue')}
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
                      {new Date(order.criado_em).toLocaleString('pt-BR')}
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
                    <strong>Itens:</strong>
                    <ul>
                      {order.itens?.map((item, index) => (
                        <li key={index}>
                          {item.quantidade}x {item.nome_item}
                        </li>
                      ))}
                    </ul>
                  </div>

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
                    {order.forma_pagamento === 'dinheiro' && 'Dinheiro'}
                    {order.forma_pagamento === 'cartao_credito' && 'Cartão de Crédito'}
                    {order.forma_pagamento === 'cartao_debito' && 'Cartão de Débito'}
                    {order.forma_pagamento === 'pix' && 'PIX'}
                    {' | '}
                    <strong>Total: R$ {order.total.toFixed(2)}</strong>
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
                      Marcar como "{getNextStatusLabel(order.status)}"
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
