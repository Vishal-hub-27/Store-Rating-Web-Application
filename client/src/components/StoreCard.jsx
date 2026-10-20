import { useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import StarRating from './StarRating';

// One store card (the old hotel listing card). It also contains the rating form.
function StoreCard({ store, onRatingSaved }) {
  const [selected, setSelected] = useState(store.myRating || 0); // stars chosen in the form
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (selected < 1 || selected > 5) {
      setError('Please choose a star rating from 1 to 5.');
      return;
    }

    setSaving(true);
    try {
      // The same PUT request creates the first rating and updates later ones
      const response = await api.put(`/ratings/${store.id}`, { rating: selected });
      setMessage(store.myRating ? 'Your rating was updated.' : 'Thanks! Your rating was saved.');
      onRatingSaved(store.id, response.data); // parent updates the average shown on the card
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="col">
      <div className="card listing-card">
        <div className="store-banner" aria-hidden="true">{store.name.charAt(0).toUpperCase()}</div>
        <div className="card-body mt-2">
          <h5 className="card-title mb-1"><b>{store.name}</b></h5>
          <p className="store-address"><i className="fa-solid fa-location-dot"></i> {store.address}</p>

          <p className="rating-label">Average rating</p>
          <StarRating value={store.averageRating} readOnly />
          <p className="rating-value">
            {store.ratingCount > 0
              ? `${store.averageRating} / 5 (${store.ratingCount} ${store.ratingCount === 1 ? 'rating' : 'ratings'})`
              : 'No ratings yet'}
          </p>

          <p className="rating-label mt-2">Your rating</p>
          <p className="rating-value mb-1">
            {store.myRating ? `You rated this store ${store.myRating} / 5` : "You haven't rated this store yet"}
          </p>
          <form onSubmit={handleSubmit}>
            <StarRating value={selected} onChange={setSelected} name={`rating-${store.id}`} />
            <button type="submit" className="btn btn-dark add-btn btn-sm mt-1" disabled={saving}>
              {saving ? 'Saving...' : store.myRating ? 'Update rating' : 'Submit rating'}
            </button>
          </form>
          {message && <p className="text-success small mt-2 mb-0">{message}</p>}
          {error && <p className="text-danger small mt-2 mb-0">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default StoreCard;
