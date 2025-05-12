import { jwtDecode } from 'jwt-decode'; // Corrected import

function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Get current time in seconds
    return decoded.exp < currentTime;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return true; // Assume expired if there's an error decoding the token
  }
}

export default isTokenExpired;
