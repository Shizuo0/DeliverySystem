import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Cart from './Cart';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = getCartCount();
  const isRestaurantOwner = user?.tipo === 'restaurante';
  const isClient = user?.tipo === 'cliente';

  const baseLinks = [
    { label: '🏠 Início', icon: '🏠', to: '/', exactMatch: true },
    { label: '🍽️ Restaurantes', icon: '🍽️', to: '/restaurants', hidden: isRestaurantOwner }
  ];

  const clientLinks = [
    { label: '🛒 Carrinho', icon: '🛒', to: '/cart', badge: cartCount },
    { label: '📦 Pedidos', icon: '📦', to: '/orders' },
  ];

  const isRestaurantOwner = user && user.tipo === 'restaurante';
  const isClient = user && user.tipo === 'cliente';
  const cartItemCount = getItemCount();

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">Delivery System</Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/')}>Home</Link>
          </li>
          
          {/* Menu para clientes ou visitantes */}
          {!isRestaurantOwner && (
            <li>
              <Link to="/restaurants" className={isActive('/restaurants')}>Restaurantes</Link>
            </li>
          )}

          {/* Menu para restaurantes */}
          {isRestaurantOwner && (
            <>
              <li>
                <Link to="/admin/restaurant" className={isActive('/admin/restaurant')}>
                  Meu Restaurante
                </Link>
              </li>
              <li>
                <Link to="/admin/menu" className={isActive('/admin/menu')}>
                  Cardápio
                </Link>
              </li>
              <li>
                <Link to="/admin/orders" className={isActive('/admin/orders')}>
                  Pedidos
                </Link>
              </li>
            </>
          )}

          {/* Menu para usuários logados */}
          {user ? (
            <>
              {isClient && (
                <>
                  <li>
                    <Link to="/orders" className={isActive('/orders')}>Pedidos</Link>
                  </li>
                  <li>
                    <button 
                      className="cart-icon-btn" 
                      onClick={() => setIsCartOpen(true)}
                      aria-label="Abrir carrinho"
                    >
                      🛒
                      {cartItemCount > 0 && (
                        <span className="cart-badge">{cartItemCount}</span>
                      )}
                    </button>
                  </li>
                </>
              )}
              <li>
                <Link to="/profile" className={isActive('/profile')}>
                  Perfil
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={`nav-btn ${isActive('/login')}`}>Entrar</Link>
              </li>
              <li>
                <Link to="/register" className={`nav-btn-primary ${isActive('/register')}`}>Cadastrar</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default Navbar;
