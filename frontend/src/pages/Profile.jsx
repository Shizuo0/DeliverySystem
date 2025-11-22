import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="profile">
      <h1>Meu Perfil</h1>
      <div className="profile-info">
        <p><strong>Nome:</strong> {user.nome}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Telefone:</strong> {user.telefone}</p>
        <p><strong>CPF:</strong> {user.cpf}</p>
      </div>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}

export default Profile;
