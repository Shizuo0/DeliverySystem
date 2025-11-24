import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import UserMenu from './UserMenu';
import logo from '../assets/logo.svg';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const ownerLinks = [
    { label: '🏪 Meu Restaurante', icon: '🏪', to: '/admin/restaurant' },
    { label: '📋 Cardápio', icon: '📋', to: '/admin/menu' },
    { label: '📦 Pedidos', icon: '📦', to: '/admin/orders' },
    { label: '🛵 Entregadores', icon: '🛵', to: '/admin/deliverers' },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <NavLink to="/" onClick={closeMobileMenu}>
            <img src={logo} alt="Delivery System" className="brand-logo" />
          </NavLink>
        </div>

        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-content ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-links">
            {baseLinks
              .filter((link) => !link.hidden)
              .map((link) => (
                <li key={link.to}>
                  <NavLink 
                    to={link.to} 
                    onClick={closeMobileMenu}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end={link.exactMatch}
                  >
                    <span className="nav-icon">{link.icon}</span>
                    <span className="nav-text">{link.label.replace(/^[^\s]+ /, '')}</span>
                  </NavLink>
                </li>
              ))}

            {user && (isClient ? clientLinks : ownerLinks).map((link) => (
              <li key={link.to}>
                <NavLink 
                  to={link.to} 
                  onClick={closeMobileMenu}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-text">{link.label.replace(/^[^\s]+ /, '')}</span>
                  {link.badge ? <span className="nav-badge">{link.badge}</span> : null}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {!user ? (
              <>
                <NavLink to="/login" className="nav-btn" onClick={closeMobileMenu}>
                  <span className="nav-icon">🔑</span>
                  <span>Entrar</span>
                </NavLink>
                <NavLink to="/register" className="nav-btn-primary" onClick={closeMobileMenu}>
                  <span className="nav-icon">✨</span>
                  <span>Cadastrar</span>
                </NavLink>
              </>
            ) : (
              <UserMenu />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
