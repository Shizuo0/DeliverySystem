import './ConfirmDialog.css';

function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = 'Confirmar', 
  cancelLabel = 'Cancelar',
  onConfirm, 
  onCancel,
  type = 'danger' // danger, warning, info
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-actions">
          <button 
            className="btn-cancel-dialog" 
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button 
            className={`btn-confirm-dialog btn-confirm-${type}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
