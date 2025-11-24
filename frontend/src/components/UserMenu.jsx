import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserMenu.css';

function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const isClient = user.tipo === 'cliente';

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className={`user-menu-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="user-name-display">{user.nome ? user.nome.split(' ')[0] : 'Usuário'}</span>
        <span className="chevron">▼</span>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <strong>{user.nome}</strong>
            <small>{isClient ? 'Cliente' : 'Restaurante'}</small>
          </div>
          
          <ul className="dropdown-links">
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                👤 Meu Perfil
              </Link>
            </li>
            {isClient && (
              <>
                <li>
                  <Link to="/orders" onClick={() => setIsOpen(false)}>
                    📦 Meus Pedidos
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" onClick={() => setIsOpen(false)}>
                    ⭐ Minhas Avaliações
                  </Link>
                </li>
              </>
            )}
            {!isClient && (
              <>
                <li>
                  <Link to="/admin/restaurant" onClick={() => setIsOpen(false)}>
                    🏪 Meu Restaurante
                  </Link>
                </li>
                <li>
                  <Link to="/admin/orders" onClick={() => setIsOpen(false)}>
                    📦 Pedidos Recebidos
                  </Link>
                </li>
              </>
            )}
            <li className="divider"></li>
            <li>
              <button onClick={logout} className="dropdown-logout">
                🚪 Sair
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
