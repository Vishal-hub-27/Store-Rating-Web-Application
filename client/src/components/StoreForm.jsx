import { useState } from 'react';
import { getErrorMessage } from '../services/api';
import { validateStoreName, validateAddress, validateDescription } from '../utils/validators';
import Alert from './Alert';
function StoreForm({ initialValues, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');

    const errors = {
      name: validateStoreName(form.name),
      address: validateAddress(form.address),
      description: validateDescription(form.description),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <>
      <Alert message={serverError} onClose={() => setServerError('')} />
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Store name</label>
          <input id="name" name="name" type="text" className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
            value={form.name} onChange={handleChange} />
          <div className="form-text">Maximum 60 characters.</div>
          <div className="invalid-feedback">{fieldErrors.name}</div>
        </div>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address</label>
          <textarea id="address" name="address" rows="3" className={`form-control ${fieldErrors.address ? 'is-invalid' : ''}`}
            value={form.address} onChange={handleChange}></textarea>
          <div className="form-text">Maximum 400 characters.</div>
          <div className="invalid-feedback">{fieldErrors.address}</div>
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description (optional)</label>
          <textarea id="description" name="description" rows="3" className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
            value={form.description} onChange={handleChange}></textarea>
          <div className="form-text">Tell customers about your store. Maximum 500 characters.</div>
          <div className="invalid-feedback">{fieldErrors.description}</div>
        </div>
        <button className="btn btn-success" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</button>
        <button type="button" className="btn btn-outline-dark ms-2" onClick={onCancel}>Cancel</button>
      </form>
    </>
  );
}

export default StoreForm;
