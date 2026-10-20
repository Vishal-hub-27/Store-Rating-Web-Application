// Same look as the dismissible Bootstrap alerts in the original layout.php
function Alert({ type = 'danger', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} alert-dismissible fade show col-md-6 offset-md-3 mt-3`} role="alert">
      {message}
      {onClose && <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>}
    </div>
  );
}

export default Alert;
