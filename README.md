# Smart Tourist Safety Monitoring & Incident Response System

A comprehensive Smart Tourist Safety Monitoring & Incident Response System that leverages AI, Blockchain, and Geo-Fencing technologies for ensuring traveler security and emergency assistance. This project includes a mobile app, web admin panel, and backend API to provide real-time safety features for tourists.

## 📋 Problem Statement

This system addresses the critical need for smart, technology-driven tourist safety solutions in regions like the Northeast, where tourism is a key economic driver but traditional policing and manual tracking methods are insufficient in remote and high-risk areas.

### Key Challenges:
- Insufficient real-time monitoring of tourists in remote areas
- Manual tracking methods inadequate for high-risk zones
- Lack of secure identity verification for tourists
- Delayed emergency response in critical situations
- Limited multilingual support for diverse travelers
- Privacy concerns with location tracking


## 🏗️ Project Structure

```
Smart Tourist Safety System/
├── app/                    # React Native mobile application
├── client/                 # Web client (React/Next.js)
├── backend/                # Node.js Express API server
├── admin/                  # Admin dashboard for authorities
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore configuration
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- React Native development environment
- Android Studio / Xcode (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Tourist Safety"
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Install dependencies for all modules**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Mobile App
   cd ../app
   npm install
   
   # Web Client
   cd ../client
   npm install
   
   # Admin Panel
   cd ../admin
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm start #normal mode
   npm run dev #developer mode

   ```

5. **Start the mobile app**
   ```bash
   cd app
   npx expo start
   ```

6. **Start the web client**
   ```bash
   cd client
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=7001
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/tourist_safety
```

For a complete list of environment variables, see `.env.example`.

## 📱 Mobile App

The mobile application is built with React Native and Expo, providing:

- Cross-platform compatibility (iOS & Android)
- Real-time GPS tracking
- Push notifications for emergency alerts
- Offline map access
- Emergency contact integration

### Running the Mobile App

```bash
cd app
npx expo start

# For iOS
npx expo run:ios

# For Android
npx expo run:android
```
---

**Made with ❤️ for tourist safety and security**
