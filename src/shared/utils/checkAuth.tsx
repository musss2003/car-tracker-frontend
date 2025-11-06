export async function checkAuth() {
  try {
    const response = await fetch('/api/session-check', {
      method: 'GET',
      credentials: 'include', // Necessary to include cookies with the request
    });
    const data = await response.json();
    if (response.ok) {
      return { isAuthenticated: true, user: data.user };
    } else {
      return { isAuthenticated: false };
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false };
  }
}
