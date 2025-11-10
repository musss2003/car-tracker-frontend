# Setup HTTPS for EC2 Backend

## Quick Guide to Enable HTTPS on Your Backend

### Step 1: SSH into EC2

```bash
ssh -i ~/Desktop/car-tracker/sarajevo-mus-len.pem ubuntu@54.221.162.139
```

### Step 2: Install NGINX

```bash
sudo apt update
sudo apt install nginx -y

# Verify NGINX is installed and running
sudo systemctl status nginx

# Check if sites-available directory exists
ls -la /etc/nginx/
```

### Step 3: Configure NGINX Reverse Proxy

**First, check your NGINX structure:**

```bash
# Check if sites-available exists
if [ -d "/etc/nginx/sites-available" ]; then
    echo "Using sites-available structure"
    sudo nano /etc/nginx/sites-available/car-tracker
else
    echo "Using conf.d structure"
    sudo nano /etc/nginx/conf.d/car-tracker.conf
fi
```

**Or manually create the config file:**

```bash
# For Ubuntu/Debian (sites-available)
sudo nano /etc/nginx/sites-available/car-tracker

# OR for CentOS/Amazon Linux (conf.d)
sudo nano /etc/nginx/conf.d/car-tracker.conf
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name 54.221.162.139;

    # Increase body size for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 4: Enable Site

**For Ubuntu/Debian (sites-available):**

```bash
sudo ln -s /etc/nginx/sites-available/car-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**For CentOS/Amazon Linux (conf.d):**

```bash
# Config is already in conf.d, just test and restart
sudo nginx -t
sudo systemctl restart nginx
```

**If nginx -t fails, check the error:**

```bash
sudo nginx -t
# Fix any syntax errors in your config file
```

### Step 5: Update Backend CORS

Edit your backend to allow Vercel domain:

```javascript
// In your Express app.ts or server.js
const allowedOrigins = [
  'http://localhost:5173',
  'https://car-tracker-frontend-lime.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
```

### Step 6: For HTTPS with Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt

# Update NGINX config
sudo nano /etc/nginx/sites-available/car-tracker
```

**Add HTTPS configuration:**

```nginx
server {
    listen 443 ssl;
    server_name 54.221.162.139;

    ssl_certificate /etc/ssl/certs/selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/selfsigned.key;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name 54.221.162.139;
    return 301 https://$server_name$request_uri;
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Update Frontend Environment Variable

In Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Update `VITE_API_BASE_URL` to `https://54.221.162.139`
3. Redeploy

### Step 8: Update Local .env

```properties
VITE_API_BASE_URL=https://54.221.162.139
MODE=production
```

### Step 9: Open Port 443 in EC2 Security Group ⚠️ CRITICAL

1. Go to **AWS Console** → **EC2** → **Security Groups**
2. Select your instance's security group
3. Click **Edit inbound rules**
4. Click **Add rule**
5. Configure:
   - **Type**: HTTPS
   - **Protocol**: TCP
   - **Port range**: 443
   - **Source**: 0.0.0.0/0 (Anywhere IPv4)
   - **Description**: HTTPS for frontend
6. Click **Add rule** again for port 80:
   - **Type**: HTTP
   - **Protocol**: TCP
   - **Port range**: 80
   - **Source**: 0.0.0.0/0
   - **Description**: HTTP redirect to HTTPS
7. Click **Save rules**

### Step 10: Verify Setup

**On your EC2 instance, run:**

```bash
# Check NGINX is listening on 443
sudo netstat -tlnp | grep :443

# Check NGINX status
sudo systemctl status nginx

# Test locally
curl -k https://localhost/api/auth/session-check

# Check NGINX logs for errors
sudo tail -20 /var/log/nginx/error.log
```

**From your local machine:**

```bash
# Test if port 443 is accessible
curl -k https://54.221.162.139/api/auth/session-check

# Should return backend response or 401 Unauthorized (which is fine)
```

### Troubleshooting

**Problem: CORS errors, request doesn't reach backend**

✅ **Solution:**

1. Verify port 443 is open in AWS Security Group (Step 9)
2. Verify NGINX is running: `sudo systemctl status nginx`
3. Check NGINX is listening: `sudo netstat -tlnp | grep :443`
4. Restart NGINX: `sudo systemctl restart nginx`

**Problem: "SSL certificate problem:git merge featu self signed certificate"**

✅ **Solution:** This is expected with self-signed certificates. Your browser will show a warning. Click "Advanced" → "Proceed to site" or "Accept Risk and Continue"

**Problem: NGINX won't start**

```bash
# Check syntax errors
sudo nginx -t

# View detailed errors
sudo journalctl -u nginx -n 50
```

**Problem: Port 443 still blocked**

```bash
# Check if UFW firewall is blocking
sudo ufw status

# If active, allow ports
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
```

### Notes:

- Self-signed certificates will show browser warnings
- For production, use Let's Encrypt (requires domain name)
- Make sure your backend is rupm2nning on port 5001

### Alternative: Use a Domain with Let's Encrypt (Recommended for Production)

If you have a domain:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

This automatically configures HTTPS with a valid certificate.
