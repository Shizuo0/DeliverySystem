import './ErrorMessage.css';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Ops! Algo deu errado</h3>
      <p className="error-text">{message || 'Ocorreu um erro inesperado'}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          Tentar Novamente
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
