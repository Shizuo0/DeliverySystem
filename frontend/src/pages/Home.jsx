import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { user } = useAuth();
  
  const isRestaurantOwner = user && user.tipo === 'restaurante';
  const isClient = user && user.tipo === 'cliente';

  return (
    <div className="home">
      <h1>Delivery System</h1>
      <p>Bem-vindo ao nosso sistema de delivery!</p>
      
      {!user && (
        <div className="home-links">
          <Link to="/restaurants">Ver Restaurantes</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Cadastrar</Link>
        </div>
      )}

      {isClient && (
        <div className="home-links">
          <Link to="/restaurants">Ver Restaurantes</Link>
          <Link to="/orders">Meus Pedidos</Link>
          <Link to="/profile">Meu Perfil</Link>
        </div>
      )}

      {isRestaurantOwner && (
        <div className="home-links">
          <Link to="/admin/restaurant">Gerenciar Restaurante</Link>
          <Link to="/admin/menu">Gerenciar Cardápio</Link>
          <Link to="/profile">Meu Perfil</Link>
        </div>
      )}
    </div>
  );
}

export default Home;
