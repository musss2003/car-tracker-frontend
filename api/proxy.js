// Vercel Serverless Function to Proxy Backend Requests
// This bypasses CORS and SSL certificate issues

// Rate limiting: Track requests by IP
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests
const RATE_WINDOW = 60 * 1000; // per 60 seconds

// Security: Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.timestamp > RATE_WINDOW) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export default async function handler(req, res) {
  const { method, body, url } = req;
  
  // Security: Get client IP
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   'unknown';
  
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
  
  // Extract the path after /api/proxy
  const path = url.replace('/api/proxy', '');
  
  // Security: Validate path (prevent path traversal)
  if (path.includes('..') || path.includes('//')) {
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
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward the status code from backend
    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy error',
      message: 'Backend service unavailable' 
    });
  }
}
