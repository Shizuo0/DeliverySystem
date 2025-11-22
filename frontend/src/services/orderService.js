import api from './api';

// Endereços do Cliente
export const getClientAddresses = async () => {
  const response = await api.get('/enderecos-cliente');
  return response.data;
};

export const createAddress = async (data) => {
  const response = await api.post('/enderecos-cliente', data);
  return response.data;
};

export const updateAddress = async (id, data) => {
  const response = await api.put(`/enderecos-cliente/${id}`, data);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await api.delete(`/enderecos-cliente/${id}`);
  return response.data;
};

// Pedidos
export const createOrder = async (data) => {
  const response = await api.post('/pedidos', data);
  return response.data;
};

export const getClientOrders = async () => {
  const response = await api.get('/pedidos/cliente');
  return response.data;
};

export const getRestaurantOrders = async () => {
  const response = await api.get('/pedidos/restaurante');
  return response.data;
};

export const getDeliveryOrders = async () => {
  const response = await api.get('/pedidos/entregador');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/pedidos/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/pedidos/${id}/status`, { status });
  return response.data;
};

export const assignDelivery = async (pedidoId, entregadorId) => {
  const response = await api.patch(`/pedidos/${pedidoId}/entregador`, { entregador_id: entregadorId });
  return response.data;
};

// Avaliações
export const createReview = async (data) => {
  const response = await api.post('/avaliacoes', data);
  return response.data;
};

export const getRestaurantReviews = async (restauranteId) => {
  const response = await api.get(`/avaliacoes/restaurante/${restauranteId}`);
  return response.data;
};

export const getDeliveryReviews = async (entregadorId) => {
  const response = await api.get(`/avaliacoes/entregador/${entregadorId}`);
  return response.data;
};
