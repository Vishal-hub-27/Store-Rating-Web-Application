import { Fragment } from 'react';

const LABELS = { 1: 'Terrible', 2: 'Not good', 3: 'Average', 4: 'Very good', 5: 'Amazing' };

// Uses the original starability CSS from rating.css.
// - readOnly: shows stars for a value (like .starability-result in the old reviews list)
// - otherwise: shows clickable stars (like .starability-slot in the old review form)
// `name` must be unique per store so the radio groups on one page do not clash.
// (Fragment, not <span>: the CSS needs each input and its label to be direct siblings.)
function StarRating({ value = 0, onChange, readOnly = false, name = 'rating' }) {
  if (readOnly) {
    const rounded = Math.round(value); // stars show whole numbers; the exact number is shown as text
    return (
      <div
        className="starability-result"
        data-rating={rounded > 0 ? rounded : undefined}
        role="img"
        aria-label={value > 0 ? `Rated ${value} out of 5` : 'Not rated yet'}
      ></div>
    );
  }

  return (
    <fieldset className="starability-slot">
      <input type="radio" id={`${name}-none`} className="input-no-rate" name={name} value="0"
        checked={value === 0} onChange={() => onChange(0)} aria-label="No rating." />
      {[1, 2, 3, 4, 5].map((star) => (
        <Fragment key={star}>
          <input type="radio" id={`${name}-${star}`} name={name} value={star}
            checked={value === star} onChange={() => onChange(star)} />
          <label htmlFor={`${name}-${star}`} title={LABELS[star]}>{star} star{star > 1 ? 's' : ''}</label>
        </Fragment>
      ))}
    </fieldset>
  );
}

export default StarRating;
