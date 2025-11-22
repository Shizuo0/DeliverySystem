import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, createReview } from '../services/orderService';
import Loading from '../components/Loading';
import './ReviewOrder.css';

function ReviewOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [restaurantComment, setRestaurantComment] = useState('');
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [deliveryComment, setDeliveryComment] = useState('');
  const [hoveredRestaurantStar, setHoveredRestaurantStar] = useState(0);
  const [hoveredDeliveryStar, setHoveredDeliveryStar] = useState(0);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const data = await getOrderById(id);
      
      if (data.status !== 'entregue') {
        setError('Este pedido ainda não foi entregue');
        return;
      }
      
      setOrder(data);
    } catch (err) {
      setError('Erro ao carregar pedido');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (restaurantRating === 0) {
      setError('Por favor, avalie o restaurante');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Avaliação do restaurante
      await createReview({
        pedido_id: order.id,
        tipo: 'restaurante',
        avaliado_id: order.restaurante_id,
        nota: restaurantRating,
        comentario: restaurantComment || null
      });

      // Avaliação do entregador (se houver)
      if (order.entregador_id && deliveryRating > 0) {
        await createReview({
          pedido_id: order.id,
          tipo: 'entregador',
          avaliado_id: order.entregador_id,
          nota: deliveryRating,
          comentario: deliveryComment || null
        });
      }

      navigate('/orders', { 
        state: { message: 'Avaliação enviada com sucesso!' } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar avaliação');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, setRating, hovered, setHovered, label }) => {
    return (
      <div className="star-rating-container">
        <label>{label}</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${star <= (hovered || rating) ? 'filled' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && (
          <span className="rating-text">
            {rating === 1 && 'Muito ruim'}
            {rating === 2 && 'Ruim'}
            {rating === 3 && 'Regular'}
            {rating === 4 && 'Bom'}
            {rating === 5 && 'Excelente'}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return <Loading message="Carregando..." />;
  }

  if (error && !order) {
    return (
      <div className="review-container">
        <div className="error-message">{error}</div>
        <button className="btn-primary" onClick={() => navigate('/orders')}>
          Voltar para Meus Pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="review-container">
      <button className="btn-back" onClick={() => navigate(`/orders/${id}`)}>
        ← Voltar
      </button>

      <div className="review-header">
        <h1>Avaliar Pedido</h1>
        <p>Sua opinião nos ajuda a melhorar</p>
      </div>

      {order && (
        <div className="order-info-summary">
          <h3>Pedido #{order.id}</h3>
          <p>{order.restaurante_nome}</p>
          <p className="order-date">
            {new Date(order.data_pedido).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="review-form">
        {/* Avaliação do Restaurante */}
        <section className="review-section">
          <h2>Como foi sua experiência com o restaurante?</h2>
          
          <StarRating
            rating={restaurantRating}
            setRating={setRestaurantRating}
            hovered={hoveredRestaurantStar}
            setHovered={setHoveredRestaurantStar}
            label="Avalie o restaurante *"
          />

          <div className="form-group">
            <label>Comentário (opcional)</label>
            <textarea
              value={restaurantComment}
              onChange={(e) => setRestaurantComment(e.target.value)}
              placeholder="Conte-nos sobre sua experiência com o restaurante..."
              rows="4"
              maxLength="500"
            />
            <span className="char-count">
              {restaurantComment.length}/500
            </span>
          </div>
        </section>

        {/* Avaliação do Entregador */}
        {order?.entregador_id && (
          <section className="review-section">
            <h2>Como foi a entrega?</h2>
            
            <StarRating
              rating={deliveryRating}
              setRating={setDeliveryRating}
              hovered={hoveredDeliveryStar}
              setHovered={setHoveredDeliveryStar}
              label={`Avalie ${order.entregador_nome || 'o entregador'} (opcional)`}
            />

            <div className="form-group">
              <label>Comentário (opcional)</label>
              <textarea
                value={deliveryComment}
                onChange={(e) => setDeliveryComment(e.target.value)}
                placeholder="Conte-nos sobre sua experiência com a entrega..."
                rows="4"
                maxLength="500"
              />
              <span className="char-count">
                {deliveryComment.length}/500
              </span>
            </div>
          </section>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit-review"
            disabled={submitting || restaurantRating === 0}
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate(`/orders/${id}`)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewOrder;
