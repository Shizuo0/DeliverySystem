import api from './api';

// Restaurantes - Cliente
export const getRestaurants = async () => {
  const response = await api.get('/restaurantes');
  return response.data;
};

export const getRestaurantById = async (id) => {
  const response = await api.get(`/restaurantes/${id}`);
  return response.data;
};

// Cardápio
export const getRestaurantMenu = async (restauranteId) => {
  const response = await api.get(`/restaurantes/${restauranteId}/cardapio`);
  return response.data;
};

export const getCategorias = async (restauranteId) => {
  const response = await api.get(`/restaurantes/${restauranteId}/categorias`);
  return response.data;
};

// Admin - Restaurante
export const updateRestaurant = async (data) => {
  const response = await api.put('/restaurantes', data);
  return response.data;
};

export const toggleRestaurantStatus = async () => {
  const response = await api.patch('/restaurantes/status');
  return response.data;
};

// Admin - Categorias
export const createCategoria = async (data) => {
  const response = await api.post('/categorias-cardapio', data);
  return response.data;
};

export const updateCategoria = async (id, data) => {
  const response = await api.put(`/categorias-cardapio/${id}`, data);
  return response.data;
};

export const deleteCategoria = async (id) => {
  const response = await api.delete(`/categorias-cardapio/${id}`);
  return response.data;
};

// Admin - Itens do Cardápio
export const createMenuItem = async (data) => {
  const response = await api.post('/itens-cardapio', data);
  return response.data;
};

export const updateMenuItem = async (id, data) => {
  const response = await api.put(`/itens-cardapio/${id}`, data);
  return response.data;
};

export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/itens-cardapio/${id}`);
  return response.data;
};

export const toggleMenuItemAvailability = async (id) => {
  const response = await api.patch(`/itens-cardapio/${id}/disponibilidade`);
  return response.data;
};
