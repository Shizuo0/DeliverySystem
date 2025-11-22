import './Loading.css';

function Loading({ message = 'Carregando...' }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner-icon"></div>
      <p>{message}</p>
    </div>
  );
}

export default Loading;
