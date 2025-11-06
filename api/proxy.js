// Vercel Serverless Function to Proxy Backend Requests
// This bypasses CORS and SSL certificate issues

export default async function handler(req, res) {
  const { method, body, url } = req;
  
  // Extract the path after /api/proxy
  const path = url.replace('/api/proxy', '');
  
  // Backend URL (can use HTTP since it's server-to-server)
  const backendUrl = `http://54.221.162.139:5001${path}`;
  
  console.log(`Proxying ${method} request to: ${backendUrl}`);

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const fetchOptions = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (method !== 'GET' && method !== 'HEAD' && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(backendUrl, fetchOptions);
    const data = await response.json();

    // Forward the status code from backend
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error',
      message: error.message 
    });
  }
}
