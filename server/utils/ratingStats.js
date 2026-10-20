const Rating = require('../models/Rating');

// Calculates the average rating and rating count from the real rating documents.
// Step 1: fetch the ratings of the given stores. Step 2: add them up per store. Step 3: average = total / count.
// Returns an object like { "<storeId>": { averageRating: 4.5, ratingCount: 2 } }
async function getRatingStats(storeIds) {
  const ratings = await Rating.find({ storeId: { $in: storeIds } }).select('storeId rating');

  const totals = {}; // { storeId: { total, count } }
  ratings.forEach((item) => {
    const id = item.storeId.toString();
    if (!totals[id]) totals[id] = { total: 0, count: 0 };
    totals[id].total += item.rating;
    totals[id].count += 1;
  });

  const stats = {};
  Object.keys(totals).forEach((id) => {
    const average = totals[id].total / totals[id].count;
    stats[id] = {
      averageRating: Math.round(average * 10) / 10, // 1 decimal place, e.g. 4.3
      ratingCount: totals[id].count,
    };
  });
  return stats;
}

module.exports = { getRatingStats };
