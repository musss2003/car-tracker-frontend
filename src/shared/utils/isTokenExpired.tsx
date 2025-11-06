import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    
    // If there's no exp claim, consider the token as expired
    if (!decoded.exp) {
      return true;
    }
    
    const currentTime = Date.now() / 1000; // Get current time in seconds
    return decoded.exp < currentTime;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return true; // Assume expired if there's an error decoding the token
  }
}

export default isTokenExpired;
