# Docker Deployment Guide

## Problem Fixed
Your frontend and backend were running in **isolated** Docker containers. They couldn't communicate because:
- Frontend tried to reach backend at `http://4.240.89.33:5000` (external IP)
- Containers on same host should use Docker networking (container names)
- No Nginx proxy was configured to route `/api` requests

## Solution
1. **Docker Compose** - Containers now on same network (`academicpro-network`)
2. **Nginx Proxy** - Frontend Nginx proxies `/api` → `backend:5000` container
3. **Simplified Config** - Frontend uses `/api`, no hardcoded IPs needed

## Files Changed
- `docker-compose.yml` - Orchestrates both containers on shared network
- `frontend/nginx.conf` - Proxies API calls to backend container
- `frontend/Dockerfile` - Includes custom Nginx config
- `frontend/src/api/axios.js` - Uses `/api` (proxied by Nginx)
- `.github/workflows/deploy.yml` - Uses `docker-compose` for deployment

## Deploy to Azure VM

### First Time Setup
```bash
# SSH to your Azure VM
ssh user@4.240.89.33

# Install Docker and Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and back in for group changes

# Clone repo
git clone https://github.com/MiniduOshan/AcademicPro.git ~/project
cd ~/project

# Create backend .env
cat <<EOF > backend/.env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://4.240.89.33
EOF

# Start with Docker Compose
docker-compose up -d --build
```

### Subsequent Deploys
Your GitHub Actions workflow automatically:
1. Clones fresh code
2. Creates backend `.env` from secrets
3. Runs `docker-compose up -d --build`

### Manual Deploy/Update
```bash
cd ~/project
git pull origin main
docker-compose down
docker-compose up -d --build
```

## How It Works

### Container Network
```
Frontend Container (port 80) ←→ academicpro-network ←→ Backend Container (port 5000)
         ↓                                                         ↑
    Nginx Proxy                                                    |
         └──────────────── /api/* ─────────────────────────────────┘
```

### Request Flow
1. Browser → `http://4.240.89.33/api/users/login`
2. Nginx in frontend container sees `/api/`
3. Nginx proxies to `http://backend:5000/users/login` (container name resolution)
4. Backend processes request
5. Response back through Nginx to browser

## Verify Deployment

```bash
# Check containers running
docker-compose ps

# Check logs
docker-compose logs frontend
docker-compose logs backend

# Test backend directly
curl http://localhost:5000

# Test frontend (from browser)
http://4.240.89.33
```

## Local Development (Without Docker)

```bash
# Terminal 1 - Backend
cd backend
cp .env.example .env  # edit with your values
npm install
npm start

# Terminal 2 - Frontend
cd frontend
cp .env.local.example .env.local
# Edit .env.local and uncomment: VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

## Troubleshooting

### Frontend can't reach backend
```bash
# Check if containers are on same network
docker network inspect academicpro_academicpro-network

# Check Nginx config in frontend
docker exec academicpro-frontend cat /etc/nginx/conf.d/default.conf

# Test from frontend container to backend
docker exec academicpro-frontend wget -O- http://backend:5000
```

### CORS errors
Make sure `CORS_ORIGIN` in backend `.env` matches your VM IP:
```
CORS_ORIGIN=http://4.240.89.33
```

### Port conflicts
If port 80 or 5000 already in use:
```bash
# Find and stop conflicting service
sudo lsof -i :80
sudo lsof -i :5000
```
