import { setToken } from '@/app/redux/authSlice';
import { store } from '@/app/redux/store';

// Function to get token from cookies
export function getTokenFromCookies() {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'client-token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Function to set token in Redux store
export function initializeToken() {
  const token = getTokenFromCookies();
  if (token) {
    store.dispatch(setToken(token));
  }
  return token;
}

// Function to clear tokens
export function clearTokens() {
  if (typeof window === 'undefined') return;
  
  // Clear cookies
  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'client-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Function to check if user is authenticated
export function isAuthenticated() {
  return !!getTokenFromCookies();
}
