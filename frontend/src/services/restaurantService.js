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

// Admin - Restaurante
export const updateRestaurant = async (data) => {
  const response = await api.put('/restaurantes/perfil', data);
  return response.data;
};

export const updateRestaurantStatus = async (status) => {
  const response = await api.put('/restaurantes/status', { status });
  return response.data;
};

// Admin - Categorias
export const getCategorias = async () => {
  const response = await api.get('/restaurantes/categorias');
  return response.data;
};

export const createCategoria = async (data) => {
  const response = await api.post('/restaurantes/categorias', data);
  return response.data;
};

export const updateCategoria = async (id, data) => {
  const response = await api.put(`/restaurantes/categorias/${id}`, data);
  return response.data;
};

export const deleteCategoria = async (id) => {
  const response = await api.delete(`/restaurantes/categorias/${id}`);
  return response.data;
};

// Admin - Itens do Cardápio
export const getRestaurantItems = async () => {
  const response = await api.get('/restaurantes/menu/itens');
  return response.data;
};

export const createMenuItem = async (data) => {
  const response = await api.post('/restaurantes/menu/itens', data);
  return response.data;
};

export const updateMenuItem = async (id, data) => {
  const response = await api.put(`/restaurantes/menu/itens/${id}`, data);
  return response.data;
};

export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/restaurantes/menu/itens/${id}`);
  return response.data;
};

export const updateMenuItemAvailability = async (id, disponivel) => {
  const response = await api.put(`/restaurantes/menu/itens/${id}/disponibilidade`, { disponivel });
  return response.data;
};
