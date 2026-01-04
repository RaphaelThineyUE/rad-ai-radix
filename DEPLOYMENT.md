# Deployment Guide for RadReport AI

## Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud like MongoDB Atlas)
- OpenAI API key
- Server with at least 2GB RAM (recommended: 4GB+)

## Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/radreport-ai
JWT_SECRET=generate-a-secure-random-string-here
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=production
UPLOAD_DIR=./uploads
```

**Security Notes:**
- Generate JWT_SECRET with: `openssl rand -base64 32`
- Never commit the `.env` file to version control
- Use MongoDB Atlas for production database
- Rotate secrets regularly

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

For local development:
```env
VITE_API_URL=http://localhost:5000/api
```

## Local Development Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# https://www.mongodb.com/docs/manual/installation/
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application at http://localhost:5173

## Production Deployment

### Option 1: Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your-secure-password

  backend:
    build: ./backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://admin:your-secure-password@mongodb:27017/radreport-ai?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://your-backend-domain.com/api
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Deploy with Docker:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 2: Cloud Platform Deployment

#### Heroku

**Backend:**

```bash
cd backend
heroku create radreport-ai-backend

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set OPENAI_API_KEY=your-api-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

Create `backend/Procfile`:

```
web: node server.js
```

**Frontend:**

```bash
cd frontend
heroku create radreport-ai-frontend

# Set environment variable
heroku config:set VITE_API_URL=https://radreport-ai-backend.herokuapp.com/api

# Deploy
git push heroku main
```

#### Vercel (Frontend)

```bash
cd frontend
npm install -g vercel
vercel

# Set environment variables in Vercel dashboard:
# VITE_API_URL=https://your-backend.com/api
```

#### Railway / Render (Full Stack)

Both platforms support deploying from GitHub:
1. Connect your repository
2. Configure environment variables
3. Deploy with automatic builds

### Option 3: VPS Deployment (Ubuntu)

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
# Follow: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-repo/rad-ai-radix.git
cd rad-ai-radix

# Setup backend
cd backend
npm install --production
cp .env.example .env
# Edit .env with your values
pm2 start server.js --name radreport-backend

# Setup frontend
cd ../frontend
npm install
npm run build

# Install nginx
sudo apt-get install nginx

# Configure nginx to serve frontend and proxy backend
sudo nano /etc/nginx/sites-available/radreport-ai
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/rad-ai-radix/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/radreport-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Save PM2 processes
pm2 save
pm2 startup
```

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all, or specific IPs)
5. Get connection string
6. Update MONGODB_URI in `.env`

### Local MongoDB

```bash
# Install MongoDB
# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# View logs
pm2 logs radreport-backend

# Monitoring
pm2 monit

# Restart
pm2 restart radreport-backend

# Stop
pm2 stop radreport-backend
```

### Health Checks

Backend health endpoint: `GET /api/health`

```bash
curl https://your-backend.com/api/health
```

### Backup Strategy

```bash
# MongoDB backup
mongodump --uri="your-mongodb-uri" --out=/backup/$(date +%Y%m%d)

# Automate with cron
0 2 * * * /usr/bin/mongodump --uri="your-mongodb-uri" --out=/backup/$(date +\%Y\%m\%d)
```

### Logs

```bash
# PM2 logs
pm2 logs --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Scaling Considerations

### Horizontal Scaling

1. Use MongoDB Atlas with replica sets
2. Deploy multiple backend instances behind load balancer
3. Use Redis for session storage
4. CDN for frontend assets

### Performance Optimization

1. Enable gzip compression in nginx
2. Implement rate limiting
3. Cache API responses
4. Optimize database queries with indexes
5. Use connection pooling

## Security Checklist

- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured
- [ ] Database authentication enabled
- [ ] Firewall configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Error logging (don't expose sensitive data)

## Troubleshooting

### Backend won't start

```bash
# Check logs
pm2 logs radreport-backend

# Common issues:
# - MongoDB connection failed (check URI)
# - Port already in use (change PORT in .env)
# - Missing environment variables
# - Node version < 18
```

### Frontend can't connect to backend

```bash
# Check VITE_API_URL in frontend/.env
# Check CORS settings in backend
# Check network/firewall rules
# Verify backend is running: curl http://localhost:5000/api/health
```

### Upload fails

```bash
# Check uploads directory permissions
chmod 755 backend/uploads

# Check file size limits in nginx
client_max_body_size 10M;
```

## Support

For issues, check:
- Application logs
- MongoDB logs
- Nginx logs
- Browser console (frontend errors)

## License

MIT
