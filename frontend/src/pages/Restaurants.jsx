import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import api from '../services/api';

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurantes');
      setRestaurants(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar restaurantes');
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Carregando restaurantes..." />;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="restaurants">
      <h1>Restaurantes</h1>
      <div className="restaurant-list">
        {restaurants.length === 0 ? (
          <p>Nenhum restaurante disponível no momento.</p>
        ) : (
          restaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <h3>{restaurant.nome}</h3>
              <p>{restaurant.descricao}</p>
              <p><strong>Telefone:</strong> {restaurant.telefone}</p>
              <p><strong>Tempo de entrega:</strong> {restaurant.tempo_entrega_estimado} min</p>
              <p><strong>Taxa de entrega:</strong> R$ {restaurant.taxa_entrega}</p>
              <Link to={`/restaurants/${restaurant.id}`}>Ver cardápio</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Restaurants;
