import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import StoreForm from '../components/StoreForm';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

// Owner-only page: edit the information of one of MY stores.
function EditStore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStore() {
      try {
        const response = await api.get(`/stores/${id}`);
        if (!response.data.store.isOwner) {
          setError('You can only edit your own store.');
        } else {
          setStore(response.data.store);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [id]);

  async function handleUpdate(values) {
    await api.put(`/stores/${id}`, values);
    navigate(`/stores/${id}`, { state: { message: 'Store information updated.' } });
  }

  if (loading) return <Loader />;
  if (!store) return <div className="row"><Alert message={error} /></div>;

  return (
    <div className="row mt-3">
      <h3 className="col-md-8 offset-md-2">Edit store information</h3>
      <div className="col-md-8 offset-md-2">
        <StoreForm
          initialValues={{ name: store.name, address: store.address, description: store.description || '' }}
          submitLabel="Save changes"
          onSubmit={handleUpdate}
          onCancel={() => navigate(`/stores/${id}`)}
        />
      </div>
    </div>
  );
}

export default EditStore;
