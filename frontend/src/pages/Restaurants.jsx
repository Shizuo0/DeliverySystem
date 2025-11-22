import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { getRestaurants } from '../services/restaurantService';

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, open, closed

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar restaurantes');
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (filter === 'open') return restaurant.aberto;
    if (filter === 'closed') return !restaurant.aberto;
    return true;
  });

  if (loading) {
    return <Loading message="Carregando restaurantes..." />;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="restaurants">
      <div className="restaurants-header">
        <h1>Restaurantes</h1>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Todos ({restaurants.length})
          </button>
          <button 
            className={filter === 'open' ? 'active' : ''}
            onClick={() => setFilter('open')}
          >
            Abertos ({restaurants.filter(r => r.aberto).length})
          </button>
          <button 
            className={filter === 'closed' ? 'active' : ''}
            onClick={() => setFilter('closed')}
          >
            Fechados ({restaurants.filter(r => !r.aberto).length})
          </button>
        </div>
      </div>

      <div className="restaurant-list">
        {filteredRestaurants.length === 0 ? (
          <p className="empty-message">
            {filter === 'open' 
              ? 'Nenhum restaurante aberto no momento.' 
              : filter === 'closed'
              ? 'Nenhum restaurante fechado no momento.'
              : 'Nenhum restaurante disponível no momento.'}
          </p>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <div className="restaurant-card-header">
                <h3>{restaurant.nome}</h3>
                <span className={`status-indicator ${restaurant.aberto ? 'open' : 'closed'}`}>
                  {restaurant.aberto ? '🟢' : '🔴'}
                </span>
              </div>
              <p className="restaurant-description">{restaurant.descricao}</p>
              <div className="restaurant-meta">
                <span className="meta-item">⏱️ {restaurant.tempo_entrega_estimado} min</span>
                <span className="meta-item">🚚 R$ {parseFloat(restaurant.taxa_entrega).toFixed(2)}</span>
              </div>
              <Link to={`/restaurants/${restaurant.id}`} className="view-menu-link">
                Ver cardápio →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Restaurants;
