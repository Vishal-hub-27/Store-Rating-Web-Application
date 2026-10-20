// Simple Bootstrap spinner shown while data is loading
function Loader({ text = 'Loading...' }) {
  return (
    <div className="text-center mt-5" role="status">
      <div className="spinner-border text-danger" aria-hidden="true"></div>
      <p className="mt-2 text-muted">{text}</p>
    </div>
  );
}

export default Loader;
