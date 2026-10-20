import { Link } from 'react-router-dom';

// Converted from the <footer> in the old layout.php (the decorative social icons were removed
// because they did not link anywhere).
function Footer() {
  return (
    <footer>
      <div className="f-info">
        <div className="f-info-brand">&copy; StoreRate</div>
        <div className="f-info-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
