import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById, getRestaurantMenu } from '../services/restaurantService';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
      setMenu(menuData.cardapio || []);
    } catch (err) {
      setError('Erro ao carregar dados do restaurante');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = menu.map(cat => cat.nome_categoria);

  const handleAddItem = (item) => {
    if (!user) {
      toast.info('Faça login para adicionar itens ao carrinho');
      navigate('/login');
      return;
    }

    if (user.tipo !== 'cliente') {
      toast.warning('Apenas clientes podem criar pedidos.');
      return;
    }

    addToCart(
      {
        id_item: item.id_item || item.id_item_cardapio || item.id,
        nome: item.nome,
        descricao: item.descricao,
        preco: Number(item.preco),
      },
      {
        id: restaurant.id || restaurant.id_restaurante,
        nome: restaurant.nome,
        taxa_entrega: restaurant.taxa_entrega
      }
    );
  };

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

  const isOpen = restaurant.status_operacional === 'Aberto';

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
          {restaurant.endereco && (
            <div className="detail-item full-width">
              <span className="detail-label">📍 Endereço:</span>
              <span>
                {restaurant.endereco.logradouro}, {restaurant.endereco.numero}
                {restaurant.endereco.complemento && ` - ${restaurant.endereco.complemento}`}
                <br />
                {restaurant.endereco.bairro}, {restaurant.endereco.cidade} - {restaurant.endereco.estado}
              </span>
            </div>
          )}
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
            <label htmlFor="category-select" className="sr-only">Filtrar por categoria:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedCategory === 'all' ? (
          menu.map(category => (
            <div key={category.id_categoria} className="category-section">
              <h3 className="category-title">{category.nome_categoria}</h3>
              <div className="menu-items">
                {category.itens.map(item => (
                  <div 
                    key={item.id || item.id_item_cardapio} 
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
            {menu.find(c => c.nome_categoria === selectedCategory)?.itens.map(item => (
              <div 
                key={item.id || item.id_item_cardapio}  
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
