// Frontend validation. These rules match the backend rules exactly,
// but the backend still re-checks everything (never trust the browser alone).
// Each function returns an error message, or '' when the value is fine.

export function validateName(name) {
  const length = name.trim().length;
  if (length < 20 || length > 60) return 'Name must be between 20 and 60 characters.';
  return '';
}

export function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
  return '';
}

export function validateAddress(address) {
  if (address.trim() === '') return 'Address is required.';
  if (address.trim().length > 400) return 'Address must be at most 400 characters.';
  return '';
}

export function validatePassword(password) {
  if (password.length < 8 || password.length > 16) return 'Password must be 8 to 16 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
  return '';
}

export function validateStoreName(name) {
  if (name.trim() === '') return 'Store name is required.';
  if (name.trim().length > 60) return 'Store name must be at most 60 characters.';
  return '';
}

// Description is optional
export function validateDescription(description) {
  if (description.trim().length > 500) return 'Description must be at most 500 characters.';
  return '';
}