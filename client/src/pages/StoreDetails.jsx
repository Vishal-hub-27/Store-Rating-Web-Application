import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

// Details page of one store. Both roles can open it:
// - customer: sees details + all ratings, and can add or EDIT their own rating

function StoreDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState((location.state && location.state.message) || '');

  const [selected, setSelected] = useState(0); // stars chosen in the rating form
  const [saving, setSaving] = useState(false);
  const [ratingError, setRatingError] = useState('');

  async function loadStore() {
    try {
      const response = await api.get(`/stores/${id}`);
      setStore(response.data.store);
      setRatings(response.data.ratings);
      setSelected(response.data.store.myRating || 0); // pre-select the user's previous rating
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadStore();
  }, [id]);

  async function handleRatingSubmit(event) {
    event.preventDefault();
    setSuccess('');
    setRatingError('');

    if (selected < 1 || selected > 5) {
      setRatingError('Please choose a star rating from 1 to 5.');
      return;
    }

    setSaving(true);
    try {
      // The same PUT request creates the first rating and updates later ones
      const wasUpdate = !!store.myRating; // did the user already have a rating before this save?
      await api.put(`/ratings/${id}`, { rating: selected });
      await loadStore(); 
      setSuccess(wasUpdate ? 'Your rating was updated.' : 'Thanks! Your rating was saved.');
    } catch (err) {
      setRatingError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading store..." />;
  if (!store) return <div className="row mt-3"><Alert message={error} /></div>;

  const backPath = user.role === 'owner' ? '/owner' : '/stores';

  return (
    <div className="row mt-3">
      <div className="col-md-8 offset-md-2">
        <Link to={backPath} className="text-decoration-none">&larr; Back</Link>
        <Alert type="success" message={success} onClose={() => setSuccess('')} />

        <div className="store-banner store-banner-large mt-3" aria-hidden="true">{store.name.charAt(0).toUpperCase()}</div>
        <h3 className="mt-3"><b>{store.name}</b></h3>
        <p className="store-address mb-1"><i className="fa-solid fa-location-dot"></i> {store.address}</p>
        {store.ownerName && <p className="store-address">Owner: {store.ownerName}</p>}
        {store.description && <p>{store.description}</p>}

        {store.isOwner && (
          <Link to={`/stores/${id}/edit`} className="btn btn-dark add-btn btn-sm">Edit store information</Link>
        )}

        <div className="row mt-4">
          <div className="col-sm-6 mb-3">
            <p className="rating-label">Average rating</p>
            <div className="summary-number">
              {store.ratingCount > 0 ? store.averageRating : '-'}<small className="text-muted fs-6"> / 5</small>
            </div>
            <StarRating value={store.averageRating} readOnly />
            <p className="rating-value">{store.ratingCount} {store.ratingCount === 1 ? 'rating' : 'ratings'}</p>
          </div>

          {/* Only customers can rate. Owners can read ratings but not add them. */}
          {user.role === 'user' && (
            <div className="col-sm-6 mb-3">
              <p className="rating-label">Your rating</p>
              <p className="rating-value mb-1">
                {store.myRating ? `You rated this store ${store.myRating} / 5. You can change it below.` : "You haven't rated this store yet."}
              </p>
              <form onSubmit={handleRatingSubmit}>
                <StarRating value={selected} onChange={setSelected} name={`rating-${id}`} />
                <button type="submit" className="btn btn-dark add-btn btn-sm mt-1" disabled={saving}>
                  {saving ? 'Saving...' : store.myRating ? 'Update rating' : 'Submit rating'}
                </button>
              </form>
              {ratingError && <p className="text-danger small mt-2 mb-0">{ratingError}</p>}
            </div>
          )}
        </div>

        <hr />
        <p><b>Submitted ratings ({ratings.length})</b></p>
        {ratings.length === 0 ? (
          <p className="text-muted">No ratings yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  {store.isOwner && <th>Email</th>}
                  <th>Rating</th>
                  <th>Last updated</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((item) => (
                  <tr key={item.id}>
                    <td>{item.userName}</td>
                    {store.isOwner && <td>{item.userEmail}</td>}
                    <td>
                      <StarRating value={item.rating} readOnly />
                      <small className="text-muted">{item.rating} / 5</small>
                    </td>
                    <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreDetails;
