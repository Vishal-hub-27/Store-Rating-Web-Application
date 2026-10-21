import { Link } from 'react-router-dom';


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
