import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, homePathFor } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { validateEmail } from '../utils/validators';
import Alert from '../components/Alert';

// Converted from views/users/login.php (now logs in with email, as the challenge requires)
function Login() {
  const { user, login, notice, setNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go to the right home page
  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    setNotice('');

    const errors = {};
    if (validateEmail(email)) errors.email = validateEmail(email);
    if (password === '') errors.password = 'Please enter your password.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      // Go back to the page the user wanted, but only if their role may open it
      const wanted = location.state && location.state.from;
      const allowed = wanted && ((wanted === '/owner') === (loggedInUser.role === 'owner')) && wanted !== '/login';
      navigate(allowed ? wanted : homePathFor(loggedInUser.role), { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="row mt-3">
      <Alert type="warning" message={notice} onClose={() => setNotice('')} />
      <Alert message={serverError} onClose={() => setServerError('')} />
      <h2 className="col-md-8 offset-md-2">Log in</h2>
      <div className="col-md-8 offset-md-2">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" type="email" className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
              value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            <div className="invalid-feedback">{fieldErrors.email}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" type="password" className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="invalid-feedback">{fieldErrors.password}</div>
          </div>
          <button className="btn btn-success" disabled={submitting}>{submitting ? 'Logging in...' : 'Log in'}</button>
          <p className="mt-3">New here? <Link to="/register">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
}

export default Login;
