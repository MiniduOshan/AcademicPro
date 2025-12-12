# AcademicPro

Production deployment to an Azure VM (Ubuntu) with Nginx + PM2.

## Prerequisites
- Node.js >= 18 and npm installed on the VM
- Nginx installed and running (`sudo apt install nginx`)
- PM2 installed globally (`sudo npm i -g pm2`)
- MongoDB connection string ready

## Configure Environment
1. Copy environment templates and fill values:
	- Backend: see [backend/.env.example](backend/.env.example)
	- Frontend: see [frontend/.env.example](frontend/.env.example)
2. On the VM, create `~/AcademicPro/backend/.env` with your values.

## First-Time Setup on the VM
```bash
sudo apt update
sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm i -g pm2

# Clone the repo into home directory
cd ~
git clone <your-repo-url> AcademicPro

# Backend
cd ~/AcademicPro/backend
npm ci || npm install
cp .env.example .env  # then edit .env with real values
pm2 start server.js --name academic-backend --update-env

# Frontend
cd ~/AcademicPro/frontend
npm ci || npm install
npm run build

# Deploy frontend to Nginx
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo cp ~/AcademicPro/deploy/nginx-academicpro.conf /etc/nginx/sites-available/academicpro
sudo ln -sf /etc/nginx/sites-available/academicpro /etc/nginx/sites-enabled/academicpro
sudo nginx -t && sudo systemctl reload nginx
```

## Subsequent Updates (via GitHub Actions)
This repo includes [MERN Deployment to Azure VM](.github/workflows/deploy.yml). Configure these GitHub Secrets:
- `VM_IP_ADDRESS`: Public IP of the VM
- `VM_USERNAME`: SSH user
- `VM_SSH_PRIVATE_KEY`: Private key matching the VM's authorized key

Ensure the repo is cloned at `~/AcademicPro` on the VM for the workflow to `git pull` and redeploy.

## Notes
- Frontend calls the API via `/api` by default. Nginx proxies `/api` to the backend on `127.0.0.1:5000`.
- To change the API URL from the frontend, set `VITE_API_BASE_URL` in `frontend/.env`.