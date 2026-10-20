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
  const goodUser = { name: 'Brand New Test User Account', email, address: '5 Test Street, Nagpur', password: 'Test@1234' };

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
  r = await call('POST', '/api/auth/register', { ...goodUser, role: 'owner' }); // tries to sneak in owner role
  check('valid registration works', r.status === 201 && !!r.data.token);
  check('role is forced to "user"', r.data.user && r.data.user.role === 'user');
  check('password hash is not returned', !JSON.stringify(r.data).includes('$2'));
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
  check('normal user blocked from owner dashboard (403)', r.status === 403);
  r = await call('GET', '/api/owner/ratings', null, userToken);
  check('normal user blocked from owner ratings (403)', r.status === 403);
  r = await call('GET', '/api/owner/dashboard');
  check('owner dashboard needs a token (401)', r.status === 401);

  r = await call('POST', '/api/auth/login', { email: 'owner1@example.com', password: 'Owner@1234' });
  check('owner login works', r.status === 200 && r.data.user.role === 'owner');
  const owner1Token = r.data.token;
  r = await call('PUT', `/api/ratings/${storeId}`, { rating: 5 }, owner1Token);
  check('owner cannot submit ratings (403)', r.status === 403);
  r = await call('GET', '/api/owner/dashboard', null, owner1Token);
  check('owner1 sees OWN store only', r.status === 200 && r.data.store.name === 'Nagpur Electronics Hub');
  check('owner1 average 4.3 with 4 ratings', r.data.averageRating === 4.3 && r.data.ratingCount === 4, JSON.stringify(r.data));
  r = await call('GET', '/api/owner/ratings', null, owner1Token);
  check('owner1 sees 4 raters with name, email, rating', r.data.ratings.length === 4 && r.data.ratings.every((x) => x.userName && x.userEmail && x.rating), JSON.stringify(r.data).slice(0, 150));
  check('owner1 list includes the new tester', r.data.ratings.some((x) => x.userEmail === email && x.rating === 5));

  r = await call('POST', '/api/auth/login', { email: 'owner2@example.com', password: 'Owner@1234' });
  const owner2Token = r.data.token;
  r = await call('GET', '/api/owner/ratings', null, owner2Token);
  check('owner2 does NOT see owner1 raters', r.data.ratings.length === 1 && !r.data.ratings.some((x) => x.userEmail === email));
  r = await call('GET', '/api/owner/dashboard?storeId=' + storeId, null, owner2Token);
  check('owner2 cannot request owner1 store via query', r.data.store.name === 'City Books and Stationery');

  console.log('Misc');
  r = await call('GET', '/api/unknown');
  check('unknown API route -> 404 JSON', r.status === 404);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((error) => { console.error('Test crashed:', error.message); process.exit(1); });
