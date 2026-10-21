import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import StoreCard from '../components/StoreCard';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

// Owner dashboard: the owner's stores (name + average rating) and the users who rated them.
// Click a store card to open its details page (where the store can be edited).
function OwnerDashboard() {
  const location = useLocation();
  const [dashboard, setDashboard] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState((location.state && location.state.message) || '');

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Ask for both things at the same time
        const [dashboardResponse, ratingsResponse] = await Promise.all([
          api.get('/owner/dashboard'),
          api.get('/owner/ratings'),
        ]);
        setDashboard(dashboardResponse.data);
        setRatings(ratingsResponse.data.ratings);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <Loader text="Loading your dashboard..." />;
  if (!dashboard) return <div className="row"><Alert message={error} /></div>;

  return (
    <div>
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <div id="filters" className="mt-3 justify-content-between">
        <h3 className="mb-0">Owner Dashboard</h3>
        <Link to="/owner/stores/new" className="btn btn-dark add-btn">+ Add new store</Link>
      </div>

      <div className="row mt-4 mb-2">
        <div className="col-6 col-md-3">
          <p className="rating-label">Total stores</p>
          <div className="summary-number">{dashboard.totalStores}</div>
        </div>
        <div className="col-6 col-md-3">
          <p className="rating-label">Total ratings</p>
          <div className="summary-number">{dashboard.totalRatings}</div>
        </div>
      </div>

      {dashboard.stores.length === 0 ? (
        <p className="mt-5 text-center text-muted">You have not added any store yet. Click "Add new store" to start.</p>
      ) : (
        <div className="row row-cols-lg-3 row-cols-md-2 row-cols-1 mt-4">
          {dashboard.stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}

      <hr />
      <p><b>Users who rated your stores</b></p>
      {ratings.length === 0 ? (
        <p className="text-muted">No one has rated your stores yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Store</th>
                <th>Name</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.storeName}</td>
                  <td>{item.userName}</td>
                  <td>{item.userEmail}</td>
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
  );
}

export default OwnerDashboard;
