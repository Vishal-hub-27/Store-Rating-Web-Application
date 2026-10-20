import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, homePathFor } from '../context/AuthContext';

// Converted from the <nav> in the old layout.php. Same Bootstrap classes and structure.
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu (replaces Bootstrap's JavaScript)
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');

  // Keep the search box in sync with the URL (for example after clicking "clear")
  useEffect(() => {
    setSearchText(searchParams.get('search') || '');
  }, [searchParams]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleSearch(event) {
    event.preventDefault();
    const text = searchText.trim();
    navigate(text ? `/stores?search=${encodeURIComponent(text)}` : '/stores');
    closeMenu();
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-md bg-body-light border-bottom sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to={user ? homePathFor(user.role) : '/login'} aria-label="StoreRate home" onClick={closeMenu}>
          <i className="fa-solid fa-store"></i>
        </Link>
        <button className="navbar-toggler" type="button" aria-label="Toggle navigation"
          aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <div className="navbar-nav">
            {user && user.role === 'user' && <Link className="nav-link" to="/stores" onClick={closeMenu}>Stores</Link>}
            {user && user.role === 'owner' && (
              <>
                <Link className="nav-link" to="/owner" onClick={closeMenu}>My Dashboard</Link>
                <Link className="nav-link" to="/owner/stores/new" onClick={closeMenu}>Add New Store</Link>
              </>
            )}
          </div>

          {/* Search is only useful for normal users, who browse stores */}
          {user && user.role === 'user' && (
            <div className="navbar-nav ms-auto">
              <form className="d-flex" role="search" onSubmit={handleSearch}>
                <input className="form-control me-2 search-inp" type="search" value={searchText}
                  onChange={(e) => setSearchText(e.target.value)} placeholder="Search store name" aria-label="Search" />
                <button className="btn btn-search" type="submit"><i className="fa-solid fa-magnifying-glass"></i>Search</button>
              </form>
            </div>
          )}

          <div className="navbar-nav ms-auto align-items-md-center">
            {!user ? (
              <>
                <Link className="nav-link" to="/register" onClick={closeMenu}><b>Sign up</b></Link>
                <Link className="nav-link" to="/login" onClick={closeMenu}><b>Log in</b></Link>
              </>
            ) : (
              <>
                <span className="nav-link nav-user"><i className="fa-regular fa-user"></i> {user.name}</span>
                <button className="nav-link btn btn-link logout-btn" onClick={handleLogout}><b>Log out</b></button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
