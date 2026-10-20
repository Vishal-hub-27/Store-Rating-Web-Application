import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, homePathFor } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators';
import Alert from '../components/Alert';

// Converted from views/users/signup.php. Public sign up always creates a normal "user".
function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  // One handler for all inputs: the input's "name" tells us which field to update
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');

    const errors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const newUser = await register(form);
      navigate(homePathFor(newUser.role), { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="row mt-3">
      <Alert message={serverError} onClose={() => setServerError('')} />
      <h2 className="col-md-8 offset-md-2">Sign up on StoreRate</h2>
      <div className="col-md-8 offset-md-2">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full name</label>
            <input id="name" name="name" type="text" className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
              value={form.name} onChange={handleChange} />
            <div className="form-text">20 to 60 characters ({form.name.trim().length} so far).</div>
            <div className="invalid-feedback">{fieldErrors.name}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" name="email" type="email" className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
              value={form.email} onChange={handleChange} />
            <div className="invalid-feedback">{fieldErrors.email}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <textarea id="address" name="address" rows="3" className={`form-control ${fieldErrors.address ? 'is-invalid' : ''}`}
              value={form.address} onChange={handleChange}></textarea>
            <div className="form-text">Maximum 400 characters.</div>
            <div className="invalid-feedback">{fieldErrors.address}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" name="password" type="password" className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
              value={form.password} onChange={handleChange} />
            <div className="form-text">8 to 16 characters, with at least one uppercase letter and one special character.</div>
            <div className="invalid-feedback">{fieldErrors.password}</div>
          </div>
                    <div className="mb-3">
            <label className="form-label d-block">I am registering as</label>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="role" id="role-user" value="user"
                checked={form.role === 'user'} onChange={handleChange} />
              <label className="form-check-label" htmlFor="role-user">Customer</label>
            </div>
          <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="role" id="role-owner" value="owner"
                checked={form.role === 'owner'} onChange={handleChange} />
              <label className="form-check-label" htmlFor="role-owner">Store Owner</label>
            </div>
          </div>
          <button className="btn btn-success" disabled={submitting}>{submitting ? 'Creating account...' : 'Sign up'}</button>
          <p className="mt-3">Already have an account? <Link to="/login">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}

export default Register;
