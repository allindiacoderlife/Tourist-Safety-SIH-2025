# SOS API Integration Documentation

## Overview
The SOS (Save Our Souls) emergency alert system has been successfully integrated with the Tourist Safety app. This system allows users to send emergency alerts with their location information to designated emergency contacts.

## Features Implemented

### 🚨 **Core SOS Functionality**
- **Emergency Button**: Hold for 3 seconds to activate
- **Location Sharing**: Automatically includes GPS coordinates and formatted address
- **Email Alerts**: Sends emergency emails via backend API
- **Visual Feedback**: Countdown timer and status indicators
- **Haptic Feedback**: Emergency vibration patterns

### 📍 **Location Services**
- GPS coordinate retrieval with high accuracy
- Reverse geocoding (coordinates to address)
- Google Maps link generation
- Location permission handling
- Fallback handling for location failures

### 🔗 **API Integration**
- Real-time communication with backend
- User authentication integration
- Error handling and retry mechanisms
- Loading states and user feedback

## API Endpoints

### Backend SOS Endpoint
```javascript
POST /api/sos/send
Content-Type: application/json

{
  "email": "user@example.com",
  "location": "123 Main St, City, State, Country (lat, lng)",
  "coordinates": {
    "latitude": 27.4924,
    "longitude": 77.6737
  },
  "mapsLink": "https://maps.google.com/?q=27.4924,77.6737",
  "timestamp": "2025-09-12T18:30:00.000Z",
  "accuracy": 10
}
```

### Response Format
```javascript
{
  "success": true,
  "message": "SOS email sent successfully"
}
```

## Component Structure

### Main SOS Component (`/app/components/screens/SOS.jsx`)
- **Emergency Button**: Central SOS activation button
- **Quick Actions**: Police call, location sharing
- **Status Display**: Last sent, delivery status
- **User Integration**: Loads user email from storage

### Location Service (`/app/services/location.js`)
- `getCurrentLocation()`: Get GPS coordinates
- `getFormattedLocationForSOS()`: Format location for alerts
- `getSOSLocationData()`: Complete location package for SOS
- `requestLocationPermission()`: Handle permissions

### API Service (`/app/services/api.js`)
- `SOSAPI.sendSOSAlert()`: Send emergency alert
- Error handling and network timeout management
- Consistent response format handling

## Configuration (`/app/config/app.js`)
```javascript
SOS: {
  COUNTDOWN_SECONDS: 3,           // Activation countdown
  LOCATION_TIMEOUT: 10000,        // GPS timeout (10 seconds)
  VIBRATION_PATTERN: [0, 500, 200, 500, 200, 500] // Emergency haptics
}
```

## Usage Flow

### 1. **Normal SOS Activation**
```
User holds SOS button → 3-second countdown → Confirmation alert → 
Location retrieval → API call → Email sent → Success confirmation
```

### 2. **Location Sharing**
```
User taps "Share Location" → Permission check → GPS retrieval → 
Address formatting → Confirmation with maps link
```

### 3. **Quick Emergency Call**
```
User taps "Call Police" → Confirmation alert → 
Direct phone call to 112 (emergency services)
```

## Error Handling

### Location Errors
- Permission denied → User-friendly message
- GPS timeout → Fallback to "Location unavailable"
- No GPS signal → Coordinates-only format

### API Errors
- Network failure → Retry option provided
- Server error → Error message with details
- Authentication error → Re-login prompt

### User Experience
- Loading states during all operations
- Clear success/failure feedback
- Retry mechanisms for failures
- Graceful degradation when services unavailable

## Backend Integration

### Email Configuration
The backend uses nodemailer with Gmail service:
```javascript
// Environment variables required:
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

### SOS Controller Features
- Input validation (email + location required)
- Professional email formatting
- Error logging and handling
- Success/failure response formatting

## Testing

### SOS Test Component (`/app/components/debug/SOSTest.jsx`)
Comprehensive testing utility that checks:
- ✅ User data availability
- ✅ Location permissions and GPS
- ✅ Location formatting for SOS
- ✅ API connectivity and response
- ✅ Error handling scenarios

### Manual Testing Steps
1. **Login Verification**: Ensure user is authenticated
2. **Location Permission**: Grant location access when prompted
3. **SOS Button Test**: Hold button and verify countdown
4. **Location Accuracy**: Check GPS coordinates and address
5. **Email Delivery**: Verify email received at user's email
6. **Error Scenarios**: Test with no internet, no GPS, etc.

## Security Considerations

### Data Privacy
- Location data only sent during emergency
- No location tracking or storage
- User consent required for location access

### API Security
- Input validation on all endpoints
- Rate limiting to prevent abuse
- User authentication integration ready

## Production Deployment

### Environment Setup
1. **Email Service**: Configure Gmail app password
2. **Location Permissions**: Add location usage description
3. **API Endpoints**: Update base URL for production
4. **Error Monitoring**: Implement crash reporting

### Performance Optimization
- Location caching for recent coordinates
- API response caching where appropriate
- Background location updates for faster SOS

## Future Enhancements

### Planned Features
- 📱 SMS alerts in addition to email
- 👥 Multiple emergency contacts
- 🔄 Auto-retry mechanism for failed alerts
- 📊 SOS history and analytics
- 🌐 Offline mode with queued alerts

### Advanced Features
- 📞 Voice call integration
- 📹 Photo/video attachment to alerts
- 🚑 Direct emergency services integration
- 🗺️ Real-time location tracking sharing
- 👨‍⚕️ Medical information inclusion

---

## Current Status: ✅ READY FOR TESTING

The SOS API integration is now complete and ready for testing. The system handles:
- ✅ User authentication integration
- ✅ Real-time location retrieval
- ✅ Emergency alert sending
- ✅ Comprehensive error handling
- ✅ User feedback and confirmation

Test with your registered user account (`+918923667469`) and verify email delivery!