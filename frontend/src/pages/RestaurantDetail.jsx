import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById, getRestaurantMenu } from '../services/restaurantService';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import './RestaurantDetail.css';

function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const [restaurantData, menuData] = await Promise.all([
        getRestaurantById(id),
        getRestaurantMenu(id)
      ]);
      setRestaurant(restaurantData);
      setMenu(menuData);
    } catch (err) {
      setError('Erro ao carregar dados do restaurante');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupedMenu = menu.reduce((acc, item) => {
    const categoria = item.categoria_nome || 'Sem categoria';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedMenu);

  const filteredMenu = selectedCategory === 'all' 
    ? menu 
    : groupedMenu[selectedCategory] || [];

  const handleAddItem = (item) => {
    addItem(
      item,
      {
        id: restaurant.id,
        nome: restaurant.nome,
        taxa_entrega: restaurant.taxa_entrega,
        tempo_entrega_estimado: restaurant.tempo_entrega_estimado
      }
    );
  };

  if (loading) {
    return <Loading message="Carregando restaurante..." />;
  }

  if (error) {
    return (
      <div className="restaurant-detail">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/restaurants')}>Voltar</button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-detail">
        <p>Restaurante não encontrado</p>
        <button onClick={() => navigate('/restaurants')}>Voltar</button>
      </div>
    );
  }

  const isOpen = restaurant.aberto;

  return (
    <div className="restaurant-detail">
      <button className="btn-back" onClick={() => navigate('/restaurants')}>
        ← Voltar
      </button>

      <div className="restaurant-header">
        <div className="restaurant-info">
          <h1>{restaurant.nome}</h1>
          <div className={`status-badge ${isOpen ? 'open' : 'closed'}`}>
            {isOpen ? '🟢 Aberto' : '🔴 Fechado'}
          </div>
        </div>
        <p className="restaurant-description">{restaurant.descricao}</p>
        
        <div className="restaurant-details">
          <div className="detail-item">
            <span className="detail-label">📞 Telefone:</span>
            <span>{restaurant.telefone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">⏱️ Tempo de entrega:</span>
            <span>{restaurant.tempo_entrega_estimado} min</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">🚚 Taxa de entrega:</span>
            <span>R$ {parseFloat(restaurant.taxa_entrega).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {!isOpen && (
        <div className="warning-message">
          Este restaurante está fechado no momento. Não é possível fazer pedidos.
        </div>
      )}

      <div className="menu-section">
        <h2>Cardápio</h2>
        
        {categories.length > 1 && (
          <div className="category-filter">
            <button 
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {selectedCategory === 'all' ? (
          categories.map(category => (
            <div key={category} className="category-section">
              <h3 className="category-title">{category}</h3>
              <div className="menu-items">
                {groupedMenu[category].map(item => (
                  <div 
                    key={item.id} 
                    className={`menu-item ${!item.disponivel ? 'unavailable' : ''}`}
                  >
                    <div className="menu-item-info">
                      <h4>{item.nome}</h4>
                      <p className="menu-item-description">{item.descricao}</p>
                      <p className="menu-item-price">
                        R$ {parseFloat(item.preco).toFixed(2)}
                      </p>
                    </div>
                    {!item.disponivel && (
                      <div className="unavailable-badge">Indisponível</div>
                    )}
                    {item.disponivel && isOpen && (
                      <button 
                        className="btn-add-item"
                        onClick={() => handleAddItem(item)}
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="menu-items">
            {filteredMenu.map(item => (
              <div 
                key={item.id} 
                className={`menu-item ${!item.disponivel ? 'unavailable' : ''}`}
              >
                <div className="menu-item-info">
                  <h4>{item.nome}</h4>
                  <p className="menu-item-description">{item.descricao}</p>
                  <p className="menu-item-price">
                    R$ {parseFloat(item.preco).toFixed(2)}
                  </p>
                </div>
                {!item.disponivel && (
                  <div className="unavailable-badge">Indisponível</div>
                )}
                {item.disponivel && isOpen && (
                  <button 
                    className="btn-add-item"
                    onClick={() => handleAddItem(item)}
                  >
                    Adicionar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {menu.length === 0 && (
          <p className="empty-message">Este restaurante ainda não possui itens no cardápio.</p>
        )}
      </div>
    </div>
  );
}

export default RestaurantDetail;
