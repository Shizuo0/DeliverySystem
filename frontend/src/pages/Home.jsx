import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <h1>Delivery System</h1>
      <p>Bem-vindo ao nosso sistema de delivery!</p>
      <div className="home-links">
        <Link to="/restaurants">Ver Restaurantes</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Cadastrar</Link>
      </div>
    </div>
  );
}

export default Home;
