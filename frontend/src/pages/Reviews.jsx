import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { getClientReviews } from '../services/reviewService';
import './Reviews.css';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getClientReviews();
        setReviews(data);
      } catch (err) {
        setError('Não foi possível carregar suas avaliações.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <Loading message="Carregando avaliações..." />;
  }

  if (error) {
    return <div className="reviews-page">
      <div className="error">{error}</div>
    </div>;
  }

  return (
    <div className="reviews-page">
      <header className="reviews-header">
        <div>
          <p className="reviews-kicker">Feedback</p>
          <h1>Minhas Avaliações</h1>
          <p className="reviews-subtitle">Acompanhe os pedidos que você já avaliou e identifique aqueles que ainda precisam de feedback.</p>
        </div>
        <Link to="/orders" className="btn-secondary">Ver pedidos</Link>
      </header>

      {reviews.length === 0 ? (
        <div className="reviews-empty">
          <div className="empty-icon">⭐</div>
          <p>Você ainda não avaliou nenhum pedido. Seus feedbacks ajudam outros usuários!</p>
          <Link to="/orders" className="btn-primary">Avaliar pedidos entregues</Link>
        </div>
      ) : (
        <section className="reviews-grid">
          {reviews.map((review) => {
            const rating = review.nota;
            const reviewDate = review.data_avaliacao || review.created_at || review.atualizado_em;

            return (
              <article key={review.id_avaliacao || review.id} className="review-card">
                <div className="review-card-header">
                  <div>
                    <p className="review-order">Pedido #{review.id_pedido}</p>
                    <h3>{review.restaurante_nome || review.restaurante?.nome}</h3>
                  </div>
                  <span className="review-date">
                    {reviewDate ? new Date(reviewDate).toLocaleDateString('pt-BR') : 'Sem data'}
                  </span>
                </div>

                <div className="review-ratings">
                  <div>
                    <span className="rating-label">Avaliação</span>
                    <span className="rating-value">{rating || '-'} ★</span>
                  </div>
                </div>

                {review.comentario && (
                  <p className="review-comment">{review.comentario}</p>
                )}

                <Link to={`/orders/${review.id_pedido}`} className="btn-link">
                  Ver detalhes do pedido
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default Reviews;
