# SOS Emergency Alert System Documentation

## Overview
The SOS Emergency Alert System is a comprehensive safety feature that allows users to quickly send emergency alerts with their location to designated contacts. The system includes both quick emergency actions and detailed alert configuration.

## Features

### 1. Hold-to-Activate SOS Button
- **Primary SOS Button**: Large red button that requires holding for 3 seconds
- **Countdown Timer**: Visual feedback during activation
- **Vibration Feedback**: Physical confirmation of activation
- **Automatic Location**: GPS coordinates included in alerts
- **Offline Capability**: Works without internet for local calls

### 2. Enhanced SOS Alert Modal
- **Emergency Type Selection**: Medical, Fire, Crime, Accident, Natural Disaster, Other
- **Priority Levels**: Critical, High, Medium, Low
- **Location Integration**: Automatic GPS and address lookup
- **Confirmation Dialog**: Prevents accidental activations
- **Visual Feedback**: Color-coded priority indicators

### 3. Quick Action Buttons
- **Police**: Direct call to emergency services (112)
- **Primary Contact**: Call designated emergency contact
- **Location Sharing**: Share current location via apps

## Technical Implementation

### Frontend Components

#### `components/screens/SOS.jsx`
Main SOS screen with:
- Hold-to-activate button with animation
- Quick action buttons
- Status display
- Enhanced SOS modal integration

#### `components/modals/EnhancedSOSAlert.jsx`
Modal for detailed emergency configuration:
- Emergency type selection with icons
- Priority level selection with colors
- Location preview
- Send confirmation

#### `components/screens/SOSHistory.jsx`
History management:
- View past alerts
- Filter by status/type
- Update alert status
- Pagination support

### Services

#### `services/api.js` - SOSAPI Class
```javascript
// Send SOS Alert
await SOSAPI.sendSOSAlert({
  email: string,
  phone: string,
  location: {
    address: string,
    latitude: number,
    longitude: number
  },
  message: string,
  emergencyType: string,
  priority: string
});

// Get SOS History
await SOSAPI.getSOSHistory(email, page, limit);

// Update SOS Status
await SOSAPI.updateSOSStatus(alertId, status);
```

#### `services/location.js` - LocationService Class
```javascript
// Get current location with address
const locationData = await LocationService.getSOSLocationData();
// Returns: { coordinates: {lat, lng}, location: "address" }
```

### Backend API Endpoints

#### POST `/api/sos/alert`
Send emergency alert
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "location": {
    "address": "123 Main St, City",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "message": "Emergency SOS Alert",
  "emergencyType": "medical",
  "priority": "high"
}
```

#### GET `/api/sos/history`
Get user's SOS history
- Query params: `email`, `page`, `limit`

#### PUT `/api/sos/:id/status`
Update alert status
```json
{
  "status": "resolved"
}
```

## Configuration

### `config/app.js` - SOS Settings
```javascript
SOS: {
  HOLD_DURATION: 3000, // 3 seconds
  EMERGENCY_TYPES: [
    { value: 'medical', label: 'Medical Emergency', icon: 'medical' },
    { value: 'fire', label: 'Fire Emergency', icon: 'flame' },
    // ... more types
  ],
  PRIORITY_LEVELS: [
    { value: 'critical', label: 'Critical', color: '#FF0000' },
    { value: 'high', label: 'High', color: '#FF5722' },
    // ... more levels
  ]
}
```

## Database Schema

### SOS Model (MongoDB)
```javascript
{
  email: String, // User's email
  phone: String, // User's phone number
  location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  message: String, // Alert message
  emergencyType: String, // Type of emergency
  priority: String, // Priority level
  status: String, // Alert status (active, resolved, etc.)
  timestamp: Date,
  emailSent: Boolean,
  emailSentAt: Date
}
```

## Email Notifications

### SMTP Configuration
The system uses nodemailer for sending email alerts:
- **Subject**: "🚨 EMERGENCY SOS ALERT - Immediate Assistance Required"
- **Content**: User details, location, emergency type, priority
- **Recipients**: Configured emergency contacts

### Email Template
```html
<h2>🚨 EMERGENCY SOS ALERT</h2>
<p><strong>Emergency Type:</strong> Medical Emergency</p>
<p><strong>Priority:</strong> High</p>
<p><strong>Location:</strong> 123 Main St, City</p>
<p><strong>GPS:</strong> 37.7749, -122.4194</p>
<p><strong>Time:</strong> 2025-09-12 10:30:00</p>
```

## Error Handling

### Common Issues
1. **Location Permission Denied**
   - Fallback to manual location entry
   - Use last known location if available

2. **Network Connectivity**
   - Queue alerts for retry when connection restored
   - Provide offline calling capabilities

3. **API Failures**
   - Retry mechanism with exponential backoff
   - Local storage of failed alerts

### Status Indicators
- **Ready**: System operational
- **Sending**: Alert in progress
- **Alert Sent**: Successfully delivered
- **Failed**: Error occurred, retry available

## Testing

### Manual Testing
1. **Hold-to-Activate**: Test 3-second hold behavior
2. **Enhanced Modal**: Verify all emergency types and priorities
3. **Location Services**: Check GPS accuracy
4. **Email Delivery**: Confirm alerts reach recipients
5. **History**: Verify past alerts are stored and displayed

### API Testing
Use the provided `test-sos.js` script:
```bash
node test-sos.js
```

## Security Considerations

1. **Rate Limiting**: Prevent spam alerts
2. **Authentication**: Verify user identity
3. **Data Privacy**: Encrypt sensitive location data
4. **Access Control**: Limit who can view/update alerts

## Deployment Checklist

- [ ] SMTP credentials configured
- [ ] MongoDB connection established
- [ ] Location permissions granted
- [ ] Emergency contact numbers verified
- [ ] Network connectivity tested
- [ ] Email delivery confirmed
- [ ] Rate limiting enabled
- [ ] Error logging configured

## Future Enhancements

1. **SMS Alerts**: Add SMS notifications alongside email
2. **Live Tracking**: Real-time location sharing during emergencies
3. **Emergency Contacts**: Multiple contact management
4. **Audio Recording**: Voice messages in alerts
5. **Offline Maps**: Cached maps for offline use
6. **Integration**: Connect with local emergency services APIs