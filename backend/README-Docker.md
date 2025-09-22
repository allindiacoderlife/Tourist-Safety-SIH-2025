# Tourist Safety Backend - Docker Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Environment variables configured

### 1. Setup Environment Variables
```bash
cp .env.production .env
# Edit .env file with your actual values
```

### 2. Build and Run
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📦 Docker Services

### Backend API (`backend`)
- **Image**: Node.js 18 Alpine
- **Port**: 7001
- **Health Check**: Automatic monitoring
- **Security**: Non-root user, minimal image

### MongoDB (`mongodb`)
- **Image**: MongoDB 7.0
- **Port**: 27017
- **Persistence**: Data volume mounted
- **Initialization**: Automatic database setup

### Nginx (`nginx`) - Optional
- **Image**: Nginx Alpine
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: Rate limiting, security headers, load balancing

## 🔧 Configuration

### Environment Variables
```bash
# Database
MONGO_ROOT_PASSWORD=secure_password

# JWT
JWT_SECRET=your_32_char_secret_key
JWT_EXPIRES_IN=7d

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## 🛠️ Development vs Production

### Development
```bash
# Run locally with hot reload
npm run dev
```

### Production
```bash
# Docker production deployment
docker-compose up -d
```

## 📊 Monitoring & Health Checks

### Health Endpoint
```
GET /api/health
```

### Docker Health Check
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3

### View Service Status
```bash
# Check container status
docker-compose ps

# View specific service logs
docker-compose logs backend
docker-compose logs mongodb

# Monitor resource usage
docker stats
```

## 🔒 Security Features

### Application Security
- Non-root user in container
- Minimal Alpine Linux base
- Security headers via Nginx
- Rate limiting (10 req/sec)

### Data Security
- JWT token authentication
- Bcrypt password hashing
- MongoDB authentication
- Environment variable isolation

## 🚀 Deployment Options

### Local Development
```bash
docker-compose up
```

### Cloud Deployment (AWS/Azure/GCP)
1. Push image to container registry
2. Update environment variables
3. Deploy with cloud container service
4. Configure load balancer and SSL

### Kubernetes Deployment
```yaml
# Use provided Kubernetes manifests
kubectl apply -f k8s/
```

## 📁 File Structure

```
backend/
├── Dockerfile              # Container definition
├── docker-compose.yml      # Multi-service setup
├── .dockerignore           # Docker build exclusions
├── nginx.conf              # Reverse proxy config
├── mongo-init.js           # Database initialization
├── healthcheck.js          # Container health check
├── .env.production         # Environment template
└── README-Docker.md        # This file
```

## 🔧 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Verify environment variables
docker-compose config
```

#### Database Connection Failed
```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check database logs
docker-compose logs mongodb
```

#### Health Check Failing
```bash
# Test health endpoint directly
curl http://localhost:7001/api/health

# Check internal network
docker-compose exec backend curl http://localhost:7001/api/health
```

### Performance Tuning

#### MongoDB Optimization
- Indexes automatically created
- Connection pooling enabled
- Memory limits configured

#### Node.js Optimization
- Production mode enabled
- Process management with PM2 (optional)
- Memory leak prevention

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed (for HTTPS)
- [ ] Database backups scheduled
- [ ] Log rotation configured
- [ ] Monitoring alerts set up
- [ ] Security scan completed
- [ ] Load testing performed
- [ ] Disaster recovery plan ready

## 📞 Support

For deployment issues:
1. Check service logs
2. Verify environment variables
3. Test network connectivity
4. Review security settings

---

**Happy Deploying! 🚀**