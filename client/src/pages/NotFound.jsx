import { Link } from 'react-router-dom';

// Converted from views/error.php
function NotFound() {
  return (
    <div className="row mt-4">
      <div className="alert alert-danger col-md-8 offset-md-2" role="alert">
        <h4 className="alert-heading">404 &ndash; Page not found</h4>
        <Link to="/" className="btn btn-dark btn-sm mt-2">Back to home</Link>
      </div>
    </div>
  );
}

export default NotFound;
