import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const isRestaurantOwner = user && user.tipo === 'restaurante';
  const isClient = user && user.tipo === 'cliente';

  return (
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
          </>
        )}

        {/* Menu para usuários logados */}
        {user ? (
          <>
            {isClient && (
              <li>
                <Link to="/orders" className={isActive('/orders')}>Pedidos</Link>
              </li>
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
  );
}

export default Navbar;
