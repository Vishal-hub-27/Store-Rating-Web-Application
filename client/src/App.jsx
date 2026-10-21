import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth, homePathFor } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import Login from './pages/Login';
import Register from './pages/Register';
import StoreList from './pages/StoreList';
import StoreDetails from './pages/StoreDetails';
import OwnerDashboard from './pages/OwnerDashboard';
import AddStore from './pages/AddStore';
import EditStore from './pages/EditStore';
import { Privacy, Terms } from './pages/InfoPages';
import NotFound from './pages/NotFound';

// "/" sends each visitor to the right place
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />;
}

// Same page shell as the old layout.php: navbar, content inside .container, footer
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer dashboard */}
            <Route path="/stores" element={<ProtectedRoute role="user"><StoreList /></ProtectedRoute>} />

            {/* Details page: any logged-in person (the page itself decides what each role sees) */}
            <Route path="/stores/:id" element={<ProtectedRoute><StoreDetails /></ProtectedRoute>} />

            {/* Owner pages */}
            <Route path="/stores/:id/edit" element={<ProtectedRoute role="owner"><EditStore /></ProtectedRoute>} />
            <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/owner/stores/new" element={<ProtectedRoute role="owner"><AddStore /></ProtectedRoute>} />

            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
