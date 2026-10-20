// Creates sample users, owners, stores and ratings for testing.
// Run with:  npm run seed      (WARNING: it clears the users, stores and ratings collections first)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');

// Test passwords (they follow the password rules: 8-16 chars, 1 uppercase, 1 special character)
const USER_PASSWORD = 'User@1234';
const OWNER_PASSWORD = 'Owner@1234';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');
  await Rating.deleteMany({});
  await Store.deleteMany({});
  await User.deleteMany({});

  const userHash = await bcrypt.hash(USER_PASSWORD, 10);
  const ownerHash = await bcrypt.hash(OWNER_PASSWORD, 10);

  // Names must be 20-60 characters, so these are written in full
  const users = await User.insertMany([
    { name: 'Nikita Demo Normal User', email: 'user@example.com', address: '12 Market Road, Nagpur, Maharashtra', password: userHash, role: 'user' },
    { name: 'Second Sample Normal User', email: 'user2@example.com', address: '45 Civil Lines, Wardha, Maharashtra', password: userHash, role: 'user' },
    { name: 'Third Sample Normal User', email: 'user3@example.com', address: '7 Station Road, Pune, Maharashtra', password: userHash, role: 'user' },
  ]);

  const owners = await User.insertMany([
    { name: 'Electronics Store Owner Account', email: 'owner1@example.com', address: '1 Tech Park, Nagpur', password: ownerHash, role: 'owner' },
    { name: 'Bookshop Store Owner Account', email: 'owner2@example.com', address: '2 College Road, Nagpur', password: ownerHash, role: 'owner' },
    { name: 'Grocery Store Owner Account', email: 'owner3@example.com', address: '3 Main Bazaar, Wardha', password: ownerHash, role: 'owner' },
    { name: 'Repair Shop Store Owner Account', email: 'owner4@example.com', address: '9 Gandhi Chowk, Nagpur', password: ownerHash, role: 'owner' },
    { name: 'Organic Store Owner Account Pune', email: 'owner5@example.com', address: '21 Garden Lane, Pune', password: ownerHash, role: 'owner' },
  ]);

  const stores = await Store.insertMany([
    { name: 'Nagpur Electronics Hub', address: '1 Tech Park, Sitabuldi, Nagpur', ownerId: owners[0]._id },
    { name: 'City Books and Stationery', address: '2 College Road, Dharampeth, Nagpur', ownerId: owners[1]._id },
    { name: 'Fresh Daily Grocery Mart', address: '3 Main Bazaar, Wardha', ownerId: owners[2]._id },
    // Each owner account owns exactly one store
    { name: 'Sharma Electronics Repair', address: '9 Gandhi Chowk, Nagpur', ownerId: owners[3]._id },
    { name: 'Green Valley Organic Store', address: '21 Garden Lane, Pune', ownerId: owners[4]._id },
  ]);

  await Rating.insertMany([
    { userId: users[0]._id, storeId: stores[0]._id, rating: 5 },
    { userId: users[1]._id, storeId: stores[0]._id, rating: 4 },
    { userId: users[2]._id, storeId: stores[0]._id, rating: 3 },
    { userId: users[1]._id, storeId: stores[1]._id, rating: 5 },
    { userId: users[2]._id, storeId: stores[2]._id, rating: 2 },
  ]);

  console.log('Seed complete.');
  console.log(`Normal users: user@example.com, user2@example.com, user3@example.com  (password: ${USER_PASSWORD})`);
  console.log(`Store owners: owner1@example.com ... owner5@example.com  (password: ${OWNER_PASSWORD})`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
