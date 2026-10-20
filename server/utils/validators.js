// Simple validation helpers. Each function returns an error message, or '' if the value is fine.

function validateName(name) {
  if (typeof name !== 'string') return 'Name is required.';
  const length = name.trim().length;
  if (length < 20 || length > 60) return 'Name must be between 20 and 60 characters.';
  return '';
}

function validateEmail(email) {
  if (typeof email !== 'string') return 'Email is required.';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) return 'Please enter a valid email address.';
  return '';
}

function validateAddress(address) {
  if (typeof address !== 'string' || address.trim() === '') return 'Address is required.';
  if (address.trim().length > 400) return 'Address must be at most 400 characters.';
  return '';
}

function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required.';
  if (password.length < 8 || password.length > 16) return 'Password must be 8 to 16 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
  return '';
}

// Rating must be a whole number from 1 to 5
function validateRating(rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return 'Rating must be a whole number between 1 and 5.';
  }
  return '';
}

// Public sign up lets the person choose: "user" (customer) or "owner" (store owner)
function validateRole(role) {
  if (role !== 'user' && role !== 'owner') return 'Please choose whether you are a customer or a store owner.';
  return '';
}

function validateStoreName(name) {
  if (typeof name !== 'string' || name.trim() === '') return 'Store name is required.';
  if (name.trim().length > 60) return 'Store name must be at most 60 characters.';
  return '';
}

// Description is optional, but if it is given it must be at most 500 characters
function validateStoreDescription(description) {
  if (description === undefined || description === null || description === '') return '';
  if (typeof description !== 'string' || description.trim().length > 500) return 'Description must be at most 500 characters.';
  return '';
}

module.exports = {
  validateName, validateEmail, validateAddress, validatePassword, validateRating,
  validateRole, validateStoreName, validateStoreDescription,
};
