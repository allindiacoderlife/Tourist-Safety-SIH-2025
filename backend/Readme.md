# Tourist Safety Backend API

A comprehensive backend API for the Tourist Safety application with user management and OTP verification system.

## 🚀 Features

- **User Management**: Complete CRUD operations for tourist users
- **OTP Verification**: SMS-based phone number verification using Textflow.js
- **Authentication**: Secure user registration and verification
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Input validation and error handling
- **Docker Support**: Containerized deployment
- **API Documentation**: Comprehensive API documentation

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **SMS Service**: Textflow.js
- **Environment**: dotenv
- **Containerization**: Docker, Docker Compose
- **Validation**: Custom middleware

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js                 # Database connection
│   └── secret.js             # Environment variables handler
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── otpController.js      # OTP verification logic
│   └── userController.js     # User CRUD operations
├── middleware/
│   └── validation.js         # Input validation middleware
├── models/
│   ├── index.js             # Models export
│   ├── OTP.js               # OTP schema
│   └── User.js              # User schema
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── index.js             # Main routes handler
│   ├── otpRoutes.js         # OTP routes
│   └── userRoutes.js        # User routes
├── services/
│   └── otpService.js        # OTP service with Textflow.js
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── .dockerignore           # Docker ignore rules
├── docker-compose.yml      # Docker composition
├── Dockerfile              # Docker container config
├── index.js                # Main application entry point
├── package.json            # Dependencies and scripts
├── API_DOCUMENTATION.md    # API documentation
└── TEXTFLOW_SETUP.md       # OTP setup guide
```

## ⚙️ Environment Setup

### Prerequisites
- Node.js (v18+)
- MongoDB
- Docker (optional)

### Environment Variables
Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/tourist-safety

# Textflow SMS Configuration
TEXTFLOW_API_KEY=your_textflow_api_key_here

# JWT Configuration  
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=24h

# OTP Configuration
OTP_EXPIRE_TIME=10
```

## 🚀 Installation & Running

### Method 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/allindiacoderlife/Tourist-Safety-SIH-2025.git
cd "Tourist Safety/backend"

# Start with docker-compose
docker-compose up --build

# Stop the container
docker-compose down
```

### Method 2: Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Or with nodemon for development
npm run dev
```

### Method 3: Manual Docker

```bash
# Build Docker image
docker build -t tourist-safety-backend .

# Run with environment file
docker run --env-file .env -p 3000:3000 tourist-safety-backend
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### User Management
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/verify` - Verify user

### OTP Verification
- `POST /api/otp/send` - Send OTP to phone
- `POST /api/otp/verify` - Verify OTP code
- `POST /api/otp/resend` - Resend OTP
- `GET /api/otp/status/:phone` - Check verification status
- `POST /api/otp/register` - Register user with OTP

### Authentication
- `POST /api/auth/register` - Register with OTP
- `POST /api/auth/login` - Login with OTP
- `POST /api/auth/verify-phone` - Verify phone number

### Health Check
- `GET /api/health` - API health status

## 🧪 Testing

### Development Mode
Without Textflow API key, use these test values:
- **OTP Code**: `123456` (for testing)
- **Phone**: Any valid format (e.g., `+1234567890`)

### Sample API Calls

```bash
# Send OTP
curl -X POST http://localhost:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# Verify OTP
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "code": "123456"}'

# Register user with OTP
curl -X POST http://localhost:3000/api/otp/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "country": "USA",
    "code": "123456"
  }'
```

## 📚 Database Schema

### User Model
```javascript
{
  name: String (required, max 100 chars)
  email: String (required, unique, max 100 chars)
  phone: String (required, unique, max 15 chars)
  country: String (required, max 50 chars)
  isVerified: Boolean (default: false)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-updated)
}
```

### OTP Model
```javascript
{
  phone: String (required)
  isVerified: Boolean (default: false)
  expiresAt: Date (TTL index)
  attempts: Number (max: 3)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-updated)
}
```

## 🔧 Configuration

### Textflow.js Setup
1. Sign up at [textflow.me](https://textflow.me)
2. Get your API key
3. Add `TEXTFLOW_API_KEY` to your `.env` file
4. SMS will be sent automatically in production

### MongoDB Setup
- Local: `mongodb://localhost:27017/tourist-safety`
- Atlas: Use connection string from MongoDB Atlas
- Docker: Configured in `docker-compose.yml`

## 🛡️ Security Features

- **Rate Limiting**: 3 OTP requests per minute per phone
- **OTP Expiration**: 10-minute automatic expiration
- **Attempt Limits**: Maximum 3 verification attempts
- **Input Validation**: Comprehensive validation middleware
- **Error Handling**: Secure error responses

## 📖 Documentation

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Textflow Setup**: See `TEXTFLOW_SETUP.md`
- **Postman Collection**: Available in documentation

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   mongod --version
   
   # Or use Docker MongoDB
   docker run -d -p 27017:27017 mongo:latest
   ```

2. **OTP Not Sending**
   - Check `TEXTFLOW_API_KEY` in `.env`
   - Verify phone number format
   - Check Textflow account credits

3. **Port Already in Use**
   ```bash
   # Change PORT in .env file or kill process
   lsof -ti:3000 | xargs kill -9
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

- **Repository**: [Tourist-Safety-SIH-2025](https://github.com/allindiacoderlife/Tourist-Safety-SIH-2025)
- **Owner**: allindiacoderlife
- **Branch**: Backend

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation files
- Review the API endpoints in `API_DOCUMENTATION.md`

---

**Status**: ✅ Active Development  
**Last Updated**: September 2025  
**Version**: 1.0.0