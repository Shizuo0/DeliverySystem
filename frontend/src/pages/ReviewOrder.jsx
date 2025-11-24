import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loading from '../components/Loading';
import './ReviewOrder.css';

function ReviewOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [restaurantRating, setRestaurantRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await api.get(`/pedidos/cliente/${id}`);
      
      const status = response.data.status?.toLowerCase();
      if (status !== 'entregue') {
        toast.warning('Você só pode avaliar pedidos entregues');
        navigate(`/orders/${id}`);
        return;
      }

      if (response.data.avaliacao) {
        toast.info('Você já avaliou este pedido');
        navigate(`/orders/${id}`);
        return;
      }

      setOrder(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      toast.error('Erro ao carregar pedido');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (restaurantRating === 0) {
      toast.warning('Por favor, avalie o pedido');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/avaliacoes/cliente', {
        id_pedido: id,
        nota: restaurantRating,
        comentario: comment || null
      });

      toast.success('Avaliação enviada com sucesso!');
      navigate(`/orders/${id}`);
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, setRating) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'filled' : ''}`}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="review-page">
      <div className="review-container">
        <div className="review-header">
          <button className="btn-back" onClick={() => navigate(`/orders/${id}`)}>
            ← Voltar
          </button>
          <h1>Avaliar Pedido #{order.id_pedido}</h1>
        </div>

        <div className="review-card">
          <div className="order-info">
            <h3>{order.restaurante?.nome}</h3>
            <p className="order-date">
              Entregue em {order.data_hora ? new Date(order.data_hora).toLocaleDateString('pt-BR') : 'Data desconhecida'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="review-form">
            {/* Avaliação */}
            <div className="rating-section">
              <h2>Como foi sua experiência?</h2>
              <p className="rating-subtitle">Avalie a qualidade da comida e do serviço</p>
              {renderStars(restaurantRating, setRestaurantRating)}
              <div className="rating-labels">
                <span>Péssimo</span>
                <span>Excelente</span>
              </div>
            </div>

            {/* Comentário */}
            <div className="comment-section">
              <label htmlFor="comment">
                <h2>Comentário (opcional)</h2>
                <p className="rating-subtitle">Conte-nos mais sobre sua experiência</p>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva seu comentário aqui..."
                rows={4}
                maxLength={500}
              />
              <span className="char-count">{comment.length}/500</span>
            </div>

            <button
              type="submit"
              className="btn-primary btn-submit"
              disabled={submitting || restaurantRating === 0}
            >
              {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReviewOrder;
