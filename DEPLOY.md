# Tourist Safety - Backend Deployment

This repository contains the Tourist Safety application with multiple components:
- `backend/` - Node.js API server
- `app/` - React Native mobile application
- `admin/` - Admin dashboard
- `client/` - Web client

## 🚀 Backend Deployment (Dokploy)

The Dockerfile in the root builds and deploys the backend API server.

### Environment Variables Required:

```bash
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your_32_character_secret_key
JWT_EXPIRE=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_SERVICE=gmail
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio SMS
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Application
NODE_ENV=production
PORT=7001
```

### API Endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-login-email` - Verify login OTP (email)
- `POST /api/auth/verify-login-phone` - Verify login OTP (phone)
- `GET /api/auth/profile` - Get user profile (protected)

### Deployment Notes:

- The backend runs on port 7001
- MongoDB Atlas connection required
- Email and SMS services configured
- Image upload via Cloudinary
- JWT authentication with 7-day expiration
- Health check endpoint for monitoring

---

**Built for SIH 2025 - Tourist Safety Platform**