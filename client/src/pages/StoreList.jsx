import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import StoreCard from '../components/StoreCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

// Customer dashboard (converted from views/listings/index.php). Shows all stores as cards; click one to see details and rate it.
function StoreList() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || ''; // comes from the navbar search box

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the stores again whenever the search text changes
  useEffect(() => {
    let ignore = false; // ignore old responses if the user searched again quickly

    async function loadStores() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/stores', { params: { search } });
        if (!ignore) setStores(response.data.stores);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadStores();
    return () => { ignore = true; };
  }, [search]);

  return (
    <div>
      <div id="filters" className="mt-3">
        <h3 className="me-4 mb-0">{search ? 'Search results' : 'Customer Dashboard'}</h3>
        {search && (
          <span>Results for <b>{search}</b> &middot; <Link to="/stores">clear</Link></span>
        )}
      </div>

      <Alert message={error} onClose={() => setError('')} />
      {loading && <Loader text="Loading stores..." />}

      {!loading && !error && stores.length === 0 && (
        <p className="mt-5 text-center text-muted">
          {search ? `No stores found for "${search}".` : 'No stores have been added yet.'}
        </p>
      )}

      <div className="row row-cols-lg-3 row-cols-md-2 row-cols-1 mt-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}

export default StoreList;
