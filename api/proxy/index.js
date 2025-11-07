// Vercel Serverless Function to Proxy Backend Requests
// This bypasses CORS and SSL certificate issues

// Rate limiting: Track requests by IP (in-memory, resets on cold start)
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 1000; // 60 seconds

// Note: setInterval doesn't work in serverless, cleanup happens on access
function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.timestamp > RATE_WINDOW) {
      requestCounts.delete(ip);
    }
  }
}

export default async function handler(req, res) {
  // Add CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, body } = req;
  
  // Get the path from query parameter (more reliable than URL parsing)
  const path = req.query.path || req.url;
  
  console.log('🔍 DEBUG - req.url:', req.url);
  console.log('🔍 DEBUG - req.query:', req.query);
  console.log('🔍 DEBUG - extracted path:', path);
  
  // Security: Get client IP
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   'unknown';
  
  // Clean up old entries first
  cleanupOldEntries();
  
  // Security: Rate limiting
  const now = Date.now();
  const ipData = requestCounts.get(clientIp) || { count: 0, timestamp: now };
  
  if (now - ipData.timestamp > RATE_WINDOW) {
    // Reset window
    ipData.count = 1;
    ipData.timestamp = now;
  } else {
    ipData.count++;
  }
  
  requestCounts.set(clientIp, ipData);
  
  if (ipData.count > RATE_LIMIT) {
    console.warn(`⚠️ Rate limit exceeded for IP: ${clientIp}`);
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.' 
    });
  }
  
  // Security: Validate request origin (prevent direct proxy access)
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [
    'https://car-tracker-frontend-lime.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  
  const isValidOrigin = allowedOrigins.some(allowed => 
    origin?.startsWith(allowed)
  );
  
  if (!isValidOrigin && process.env.NODE_ENV === 'production') {
    console.warn(`❌ Invalid origin: ${origin} from IP: ${clientIp}`);
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Invalid origin' 
    });
  }
  
  // Path is already extracted at the top
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // Security: Validate path (prevent path traversal)
  if (path.includes('..')) {
    console.warn(`❌ Suspicious path detected: ${path} from IP: ${clientIp}`);
    return res.status(400).json({ 
      error: 'Bad request',
      message: 'Invalid path' 
    });
  }
  
  // Backend URL (can use HTTP since it's server-to-server)
  const backendUrl = `http://54.221.162.139:5001${path}`;
  
  console.log(`✅ Proxying ${method} request to: ${backendUrl} from IP: ${clientIp}`);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Forwarded-For': clientIp, // Pass client IP to backend for logging
    };

    // Forward authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    
    // Forward cookies if present
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
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
    
    // Handle different content types
    const contentType = response.headers.get('content-type');
    
    // For images and binary data, stream the response directly
    if (contentType?.startsWith('image/') || 
        contentType?.startsWith('application/octet-stream') ||
        contentType?.startsWith('application/pdf')) {
      
      // Set the same content type
      res.setHeader('Content-Type', contentType);
      
      // Set other important headers
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        res.setHeader('Content-Disposition', contentDisposition);
      }
      
      // Stream the binary data
      const buffer = await response.arrayBuffer();
      res.status(response.status).send(Buffer.from(buffer));
      return;
    }
    
    // For JSON responses
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
      return;
    }
    
    // For text responses
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy error',
      message: 'Backend service unavailable' 
    });
  }
}
