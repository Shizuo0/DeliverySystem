import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { getRestaurants } from '../services/restaurantService';
import './Restaurants.css';

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
    const isOpen = restaurant.status_operacional === 'Aberto';
    if (filter === 'open') return isOpen;
    if (filter === 'closed') return !isOpen;
    return true;
  });

  if (loading) {
    return <Loading message="Carregando restaurantes..." />;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const openCount = restaurants.filter(r => r.status_operacional === 'Aberto').length;
  const closedCount = restaurants.filter(r => r.status_operacional !== 'Aberto').length;

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
            Abertos ({openCount})
          </button>
          <button 
            className={filter === 'closed' ? 'active' : ''}
            onClick={() => setFilter('closed')}
          >
            Fechados ({closedCount})
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
          filteredRestaurants.map((restaurant) => {
            const isOpen = restaurant.status_operacional === 'Aberto';
            return (
              <div key={restaurant.id_restaurante} className="restaurant-card">
                <div className="restaurant-card-header">
                  <h3>{restaurant.nome}</h3>
                  <span className={`status-indicator ${isOpen ? 'open' : 'closed'}`}>
                    {isOpen ? '🟢' : '🔴'}
                  </span>
                </div>
                <p className="restaurant-description">{restaurant.descricao}</p>
                <div className="restaurant-meta">
                  <span className="meta-item">⏱️ {restaurant.tempo_entrega_estimado} min</span>
                  <span className="meta-item">🚚 R$ {parseFloat(restaurant.taxa_entrega).toFixed(2)}</span>
                </div>
                <Link to={`/restaurants/${restaurant.id_restaurante}`} className="view-menu-link">
                  Ver cardápio →
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Restaurants;
