import api from './api';

export const getClientReviews = async () => {
  const response = await api.get('/avaliacoes/cliente');
  return response.data;
};

export const getRestaurantReviews = async () => {
  const response = await api.get('/avaliacoes/restaurante');
  return response.data;
};

export const getRestaurantReviewSummary = async () => {
  const response = await api.get('/avaliacoes/restaurante/media');
  return response.data;
};
