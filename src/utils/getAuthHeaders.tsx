export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken'); // Retrieve access token from local storage

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};
