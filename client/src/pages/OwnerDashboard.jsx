import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

// New page for store owners (it reuses the card and star styles from the hotel project)
function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
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
    loadData();
  }, []);

  if (loading) return <Loader text="Loading your dashboard..." />;
  if (!dashboard) return <div className="row"><Alert message={error} /></div>;

  return (
    <div className="row mt-3">
      <div className="col-md-10 offset-md-1">
        <h3><b>{dashboard.store.name}</b></h3>
        <p className="store-address"><i className="fa-solid fa-location-dot"></i> {dashboard.store.address}</p>

        <div className="row mt-4 mb-4">
          <div className="col-sm-6 mb-3">
            <p className="rating-label">Average rating</p>
            <div className="summary-number">
              {dashboard.ratingCount > 0 ? dashboard.averageRating : '-'}<small className="text-muted fs-6"> / 5</small>
            </div>
            <StarRating value={dashboard.averageRating} readOnly />
          </div>
          <div className="col-sm-6 mb-3">
            <p className="rating-label">Total ratings</p>
            <div className="summary-number">{dashboard.ratingCount}</div>
          </div>
        </div>

        <hr />
        <p><b>Users who rated your store</b></p>
        <Alert message={error} onClose={() => setError('')} />

        {ratings.length === 0 ? (
          <p className="text-muted">No one has rated your store yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>#</th>
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
    </div>
  );
}

export default OwnerDashboard;
