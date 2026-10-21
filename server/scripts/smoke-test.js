// Simple API test. Start the server, run `npm run seed`, then run:  npm test
// Optional: API_URL=https://your-backend.onrender.com npm test
const API = process.env.API_URL || 'http://localhost:5000';
let passed = 0;
let failed = 0;

async function call(method, path, body, token) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* no body */ }
  return { status: res.status, data };
}

function check(name, condition, extra = '') {
  if (condition) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name} ${extra}`); }
}

async function run() {
  console.log(`Testing ${API}\n`);
  const email = `tester${Date.now()}@example.com`;
  const goodUser = { name: 'Brand New Test User Account', email, address: '5 Test Street, Nagpur', password: 'Test@1234', role: 'user' };

  console.log('Health');
  check('GET /api/health', (await call('GET', '/api/health')).data.status === 'ok');

  console.log('Registration validation');
  let r = await call('POST', '/api/auth/register', { ...goodUser, name: 'Too short' });
  check('name under 20 chars rejected', r.status === 400, r.data.message);
  r = await call('POST', '/api/auth/register', { ...goodUser, name: 'A'.repeat(61) });
  check('name over 60 chars rejected', r.status === 400);
  r = await call('POST', '/api/auth/register', { ...goodUser, address: 'A'.repeat(401) });
  check('address over 400 chars rejected', r.status === 400);
  r = await call('POST', '/api/auth/register', { ...goodUser, email: 'not-an-email' });
  check('invalid email rejected', r.status === 400);
  for (const bad of ['Short@1', 'Averylongpassword@12345', 'nouppercase@123', 'NoSpecial1234']) {
    r = await call('POST', '/api/auth/register', { ...goodUser, password: bad });
    check(`bad password rejected (${bad})`, r.status === 400, r.data.message);
  }

  console.log('Register + login');
  for (const badRole of ['admin', '', undefined]) {
    r = await call('POST', '/api/auth/register', { ...goodUser, role: badRole });
    check(`invalid role rejected (${JSON.stringify(badRole)})`, r.status === 400, r.data.message);
  }
  r = await call('POST', '/api/auth/register', goodUser);
  check('customer registration works and role is saved as "user"', r.status === 201 && r.data.user.role === 'user');
  check('password hash is not returned', !JSON.stringify(r.data).includes('$2'));
  const ownerEmail = `newowner${Date.now()}@example.com`;
  r = await call('POST', '/api/auth/register', { ...goodUser, email: ownerEmail, name: 'Brand New Test Store Owner', role: 'owner' });
  check('owner registration works and role is saved as "owner"', r.status === 201 && r.data.user.role === 'owner');
  const newOwnerToken = r.data.token;
  r = await call('POST', '/api/auth/register', goodUser);
  check('duplicate email rejected', r.status === 409);
  r = await call('POST', '/api/auth/login', { email, password: 'Wrong@1234' });
  check('wrong password rejected', r.status === 401);
  r = await call('POST', '/api/auth/login', { email, password: goodUser.password });
  check('login works', r.status === 200 && !!r.data.token);
  const userToken = r.data.token;

  console.log('Stores');
  r = await call('GET', '/api/stores');
  check('stores need a login token', r.status === 401);
  r = await call('GET', '/api/stores', null, 'garbage.token.value');
  check('invalid token rejected', r.status === 401);
  r = await call('GET', '/api/stores', null, userToken);
  check('list stores', r.status === 200 && r.data.stores.length >= 5, `got ${r.data.stores && r.data.stores.length}`);
  const electronics = r.data.stores.find((s) => s.name === 'Nagpur Electronics Hub');
  check('seeded average is 4 (5,4,3) with 3 ratings', electronics && electronics.averageRating === 4 && electronics.ratingCount === 3, JSON.stringify(electronics));
  check('new user has no rating yet', electronics && electronics.myRating === null);
  r = await call('GET', '/api/stores?search=electronics', null, userToken);
  check('search "electronics" (case-insensitive) finds 2 stores', r.data.stores.length === 2, `got ${r.data.stores.length}`);
  r = await call('GET', '/api/stores?search=zzzznothing', null, userToken);
  check('search with no match returns empty list', r.status === 200 && r.data.stores.length === 0);
  r = await call('GET', '/api/stores?search=.*', null, userToken);
  check('regex characters in search are escaped', r.status === 200 && r.data.stores.length === 0);
  r = await call('GET', `/api/stores/${electronics.id}`, null, userToken);
  check('GET /api/stores/:id', r.status === 200 && r.data.store.name === 'Nagpur Electronics Hub');
  r = await call('GET', '/api/stores/not-an-id', null, userToken);
  check('invalid store id -> 400', r.status === 400);
  r = await call('GET', '/api/stores/64b7f0c2a1b2c3d4e5f60718', null, userToken);
  check('unknown store id -> 404', r.status === 404);

  console.log('Ratings');
  const storeId = electronics.id;
  for (const bad of [0, 6, 3.5, '4', null, 'abc']) {
    r = await call('PUT', `/api/ratings/${storeId}`, { rating: bad }, userToken);
    check(`rating ${JSON.stringify(bad)} rejected`, r.status === 400);
  }
  r = await call('PUT', '/api/ratings/not-an-id', { rating: 3 }, userToken);
  check('invalid store id rejected', r.status === 400);
  r = await call('PUT', '/api/ratings/64b7f0c2a1b2c3d4e5f60718', { rating: 3 }, userToken);
  check('rating a missing store -> 404', r.status === 404);
  r = await call('PUT', `/api/ratings/${storeId}`, { rating: 1 }, userToken);
  check('first rating created', r.status === 200 && r.data.myRating === 1);
  check('average recalculated (5,4,3,1 = 3.3, 4 ratings)', r.data.averageRating === 3.3 && r.data.ratingCount === 4, JSON.stringify(r.data));
  r = await call('PUT', `/api/ratings/${storeId}`, { rating: 5 }, userToken);
  check('second submit UPDATES, not duplicates (5,4,3,5 = 4.3, still 4 ratings)', r.data.averageRating === 4.3 && r.data.ratingCount === 4, JSON.stringify(r.data));
  r = await call('GET', '/api/ratings/my', null, userToken);
  check('GET /api/ratings/my shows exactly one rating', r.status === 200 && r.data.ratings.length === 1 && r.data.ratings[0].rating === 5);
  r = await call('GET', '/api/stores', null, userToken);
  check('store list shows my rating', r.data.stores.find((s) => s.id === storeId).myRating === 5);

  console.log('Roles and owner access');
  r = await call('GET', '/api/owner/dashboard', null, userToken);
  check('customer blocked from owner dashboard (403)', r.status === 403);
  r = await call('GET', '/api/owner/ratings', null, userToken);
  check('customer blocked from owner ratings (403)', r.status === 403);
  r = await call('GET', '/api/owner/dashboard');
  check('owner dashboard needs a token (401)', r.status === 401);

  r = await call('POST', '/api/auth/login', { email: 'owner1@example.com', password: 'Owner@1234' });
  check('owner login works', r.status === 200 && r.data.user.role === 'owner');
  const owner1Token = r.data.token;
  r = await call('PUT', `/api/ratings/${storeId}`, { rating: 5 }, owner1Token);
  check('owner cannot submit ratings (403)', r.status === 403);
  r = await call('GET', '/api/owner/dashboard', null, owner1Token);
  check('owner1 dashboard lists own store only', r.status === 200 && r.data.stores.length === 1 && r.data.stores[0].name === 'Nagpur Electronics Hub', JSON.stringify(r.data));
  check('owner1 store has average 4.3 and 4 ratings', r.data.stores[0].averageRating === 4.3 && r.data.stores[0].ratingCount === 4);
  check('dashboard totals are correct', r.data.totalStores === 1 && r.data.totalRatings === 4);
  r = await call('GET', '/api/owner/ratings', null, owner1Token);
  check('owner1 sees 4 raters with name, email, rating', r.data.ratings.length === 4 && r.data.ratings.every((x) => x.userName && x.userEmail && x.rating));
  r = await call('POST', '/api/auth/login', { email: 'owner2@example.com', password: 'Owner@1234' });
  const owner2Token = r.data.token;
  r = await call('GET', '/api/owner/ratings', null, owner2Token);
  check('owner2 does NOT see owner1 raters', r.data.ratings.length === 1 && !r.data.ratings.some((x) => x.userEmail === email));

  console.log('Store details');
  r = await call('GET', `/api/stores/${storeId}`, null, userToken);
  check('customer sees details + 4 ratings', r.status === 200 && r.data.ratings.length === 4 && r.data.store.isOwner === false);
  check('customer does NOT see raters\' emails', r.data.ratings.every((x) => x.userEmail === undefined));
  check('customer sees own rating on the store', r.data.store.myRating === 5);
  r = await call('GET', `/api/stores/${storeId}`, null, owner1Token);
  check('owner of the store sees emails and isOwner=true', r.data.store.isOwner === true && r.data.ratings.every((x) => x.userEmail));
  r = await call('GET', `/api/stores/${storeId}`, null, owner2Token);
  check('another owner sees isOwner=false and no emails', r.data.store.isOwner === false && r.data.ratings.every((x) => x.userEmail === undefined));

  console.log('Add and edit stores');
  const goodStore = { name: 'My Brand New Test Store', address: '8 Test Road, Nagpur', description: 'We sell test things.' };
  r = await call('POST', '/api/stores', goodStore, userToken);
  check('customer cannot add a store (403)', r.status === 403);
  r = await call('POST', '/api/stores', goodStore);
  check('adding a store needs login (401)', r.status === 401);
  for (const [label, bad] of [['empty name', { ...goodStore, name: '' }], ['name over 60', { ...goodStore, name: 'A'.repeat(61) }], ['empty address', { ...goodStore, address: '' }], ['address over 400', { ...goodStore, address: 'A'.repeat(401) }], ['description over 500', { ...goodStore, description: 'A'.repeat(501) }]]) {
    r = await call('POST', '/api/stores', bad, newOwnerToken);
    check(`store with ${label} rejected`, r.status === 400, r.data.message);
  }
  r = await call('POST', '/api/stores', goodStore, newOwnerToken);
  check('owner adds a new store', r.status === 201 && r.data.store.name === goodStore.name);
  const newStoreId = r.data.store.id;
  r = await call('GET', '/api/stores?search=brand new test', null, userToken);
  check('new store appears in the customer listing and is searchable', r.data.stores.length === 1 && r.data.stores[0].id === newStoreId);
  check('new store starts with no ratings', r.data.stores[0].ratingCount === 0 && r.data.stores[0].averageRating === 0);
  r = await call('GET', '/api/owner/dashboard', null, newOwnerToken);
  check('new owner dashboard shows the new store', r.data.stores.length === 1 && r.data.stores[0].id === newStoreId);
  r = await call('POST', '/api/stores', { ...goodStore, name: 'Second Store Of Same Owner' }, newOwnerToken);
  r = await call('GET', '/api/owner/dashboard', null, newOwnerToken);
  check('one owner can have 2 stores', r.data.totalStores === 2);

  r = await call('PUT', `/api/stores/${newStoreId}`, { ...goodStore, name: 'Hacked Name' }, owner1Token);
  check('another owner cannot edit this store (403)', r.status === 403);
  r = await call('PUT', `/api/stores/${newStoreId}`, { ...goodStore, name: 'Hacked Name' }, userToken);
  check('customer cannot edit a store (403)', r.status === 403);
  r = await call('PUT', `/api/stores/${newStoreId}`, { ...goodStore, name: '' }, newOwnerToken);
  check('edit with invalid data rejected (400)', r.status === 400);
  r = await call('PUT', '/api/stores/not-an-id', goodStore, newOwnerToken);
  check('edit with invalid id rejected (400)', r.status === 400);
  r = await call('PUT', `/api/stores/${newStoreId}`, { name: 'Renamed Test Store', address: '9 New Road', description: '' }, newOwnerToken);
  check('owner edits own store', r.status === 200 && r.data.store.name === 'Renamed Test Store');
  r = await call('GET', `/api/stores/${newStoreId}`, null, newOwnerToken);
  check('edit is saved', r.data.store.name === 'Renamed Test Store' && r.data.store.address === '9 New Road');
  r = await call('PUT', `/api/ratings/${newStoreId}`, { rating: 4 }, userToken);
  check('customer can rate the new store', r.status === 200 && r.data.averageRating === 4 && r.data.ratingCount === 1);

  console.log('Misc');
  r = await call('GET', '/api/unknown');
  check('unknown API route -> 404 JSON', r.status === 404);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((error) => { console.error('Test crashed:', error.message); process.exit(1); });
