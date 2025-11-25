import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { getRestaurants, getRestaurantMenu } from '../services/restaurantService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './Home.css';

const isRestaurantOpen = (restaurant) => {
  if (typeof restaurant?.aberto === 'boolean') {
    return restaurant.aberto;
  }
  if (typeof restaurant?.status_operacional === 'string') {
    return restaurant.status_operacional.toLowerCase() === 'aberto';
  }
  return false;
};

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuPreview, setMenuPreview] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRestaurants();
        setRestaurants(data);
        const openRestaurant = data.find((rest) => isRestaurantOpen(rest));
        setSelectedRestaurant(openRestaurant || data[0] || null);
      } catch (err) {
        setError('Não foi possível carregar o dashboard agora.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!selectedRestaurant) {
        setMenuPreview([]);
        return;
      }

      try {
        setMenuLoading(true);
        const data = await getRestaurantMenu(selectedRestaurant.id || selectedRestaurant.id_restaurante);
        
        // Handle structured response { restaurante, cardapio: [{ itens: [] }] }
        let allItems = [];
        if (data.cardapio && Array.isArray(data.cardapio)) {
          // Flatten items from all categories
          allItems = data.cardapio.reduce((acc, category) => {
            if (category.itens && Array.isArray(category.itens)) {
              return [...acc, ...category.itens];
            }
            return acc;
          }, []);
        } else if (Array.isArray(data)) {
          // Fallback for flat array if API changes back
          allItems = data;
        }

        setMenuPreview(allItems.slice(0, 6));
      } catch (err) {
        console.error('Error fetching menu:', err);
        setMenuPreview([]);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenu();
  }, [selectedRestaurant]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'open'
            ? isRestaurantOpen(restaurant)
            : !isRestaurantOpen(restaurant);
      const matchesSearch = restaurant.nome
        ?.toLowerCase()
        .includes(search.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [restaurants, filter, search]);

  const stats = useMemo(() => {
    const total = restaurants.length;
    const open = restaurants.filter((r) => isRestaurantOpen(r)).length;
    return {
      total,
      open,
      closed: total - open,
    };
  }, [restaurants]);

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleAddFromPreview = (item) => {
    if (!user) {
      toast.info('Faça login como cliente para montar o carrinho.');
      navigate('/login');
      return;
    }

    if (user.tipo !== 'cliente') {
      toast.warning('Entre com uma conta de cliente para adicionar itens.');
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
        id: selectedRestaurant.id || selectedRestaurant.id_restaurante,
        nome: selectedRestaurant.nome,
        taxa_entrega: selectedRestaurant.taxa_entrega || 0,
      }
    );
  };

  if (loading) {
    return <Loading message="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="home">
        <div className="error">{error}</div>
      </div>
    );
  }

  const canOrder = selectedRestaurant ? isRestaurantOpen(selectedRestaurant) : false;

  return (
    <div className="home">
      <section className="home-hero">
        <div>
          <p className="hero-kicker">Painel em tempo real</p>
          <h1>Explore restaurantes e cardápios em um só lugar</h1>
          <p className="hero-subtitle">
            Utilize os filtros, visualize detalhes e inicie pedidos diretamente do dashboard principal.
          </p>
        </div>
        <div className="hero-search">
          <input
            type="search"
            placeholder="Buscar restaurante"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="home-stats">
        <article>
          <span>Total de restaurantes</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Abertos agora</span>
          <strong>{stats.open}</strong>
        </article>
        <article>
          <span>Fechados</span>
          <strong>{stats.closed}</strong>
        </article>
      </section>

      <section className="home-dashboard">
        <div className="restaurant-panel">
          <header className="panel-header">
            <div>
              <h2>Restaurantes cadastrados</h2>
              <p>Selecione um restaurante para visualizar o cardápio.</p>
            </div>
            <div className="filter-group">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                Todos
              </button>
              <button
                className={filter === 'open' ? 'active' : ''}
                onClick={() => setFilter('open')}
              >
                Abertos
              </button>
              <button
                className={filter === 'closed' ? 'active' : ''}
                onClick={() => setFilter('closed')}
              >
                Fechados
              </button>
            </div>
          </header>

          <div className="restaurant-grid">
            {filteredRestaurants.length === 0 && (
              <div className="empty-message">
                Nenhum restaurante encontrado para os filtros atuais.
              </div>
            )}

            {filteredRestaurants.map((restaurant) => (
              <article
                key={restaurant.id || restaurant.id_restaurante}
                className={`restaurant-card ${
                  selectedRestaurant &&
                  ((selectedRestaurant.id || selectedRestaurant.id_restaurante) ===
                    (restaurant.id || restaurant.id_restaurante))
                    ? 'selected'
                    : ''
                }`}
                onClick={() => handleSelectRestaurant(restaurant)}
              >
                <header>
                  <h3>{restaurant.nome}</h3>
                  <span className={`status-pill ${isRestaurantOpen(restaurant) ? 'open' : 'closed'}`}>
                    {isRestaurantOpen(restaurant) ? 'Aberto' : 'Fechado'}
                  </span>
                </header>
                <p>{restaurant.descricao || 'Sem descrição cadastrada.'}</p>
                <footer>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurants/${restaurant.id || restaurant.id_restaurante}`);
                    }}
                  >
                    Ver detalhes
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </div>

        <div className="menu-panel">
          {selectedRestaurant ? (
            <div className="menu-preview">
              <div className="menu-header">
                <div>
                  <p className="menu-kicker">Cardápio em destaque</p>
                  <h2>{selectedRestaurant.nome}</h2>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    navigate(`/restaurants/${selectedRestaurant.id || selectedRestaurant.id_restaurante}`)
                  }
                >
                  Abrir cardápio completo
                </button>
              </div>

              {menuLoading && <Loading message="Carregando cardápio..." />}

              {!menuLoading && menuPreview.length === 0 && (
                <p className="empty-message">Este restaurante ainda não cadastrou itens.</p>
              )}

              <ul className="menu-list">
                {menuPreview.map((item) => (
                  <li key={item.id_item || item.id_item_cardapio || item.id}>
                    <div>
                      <h4>{item.nome}</h4>
                      <p>{item.descricao || 'Sem descrição'}</p>
                      <span>R$ {Number(item.preco).toFixed(2)}</span>
                    </div>
                    {item.disponivel && canOrder ? (
                      <button type="button" onClick={() => handleAddFromPreview(item)}>
                        Adicionar ao carrinho
                      </button>
                    ) : (
                      <span className="unavailable">Indisponível</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="empty-message">Selecione um restaurante para ver o cardápio.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
