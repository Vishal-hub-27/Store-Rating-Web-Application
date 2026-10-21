import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StoreForm from '../components/StoreForm';

// Owner-only page: create a new store. It then appears on the owner dashboard and in the customers' store list.
function AddStore() {
  const navigate = useNavigate();

  async function handleCreate(values) {
    await api.post('/stores', values);
    navigate('/owner', { state: { message: 'Your new store was added.' } });
  }

  return (
    <div className="row mt-3">
      <h3 className="col-md-8 offset-md-2">Add a new store</h3>
      <div className="col-md-8 offset-md-2">
        <StoreForm
          initialValues={{ name: '', address: '', description: '' }}
          submitLabel="Add store"
          onSubmit={handleCreate}
          onCancel={() => navigate('/owner')}
        />
      </div>
    </div>
  );
}

export default AddStore;
