import { Link } from 'react-router-dom';
import StarRating from './StarRating';

// One store card (the old hotel listing card). The whole card is a link to the store details page.
// It only DISPLAYS ratings (average + the customer's own); rating itself happens on the details page.
function StoreCard({ store }) {
  return (
    <div className="col">
      <Link to={`/stores/${store.id}`} className="listing-link">
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

            {/* Customers also see their own rating on every card (owners' cards have no myRating, so this is hidden) */}
            {store.myRating !== undefined && (
              <>
                <p className="rating-label mt-2">Your rating</p>
                <StarRating value={store.myRating || 0} readOnly />
                <p className="rating-value">
                  {store.myRating ? `You rated this store ${store.myRating} / 5` : "You haven't rated this store yet"}
                </p>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default StoreCard;
