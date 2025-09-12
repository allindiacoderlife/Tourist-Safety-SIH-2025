# Google Maps and SerpAPI Setup Guide

## Overview
This guide will help you set up Google Maps API and SerpAPI for live location tracking in the Tourist Safety Admin Panel.

## 1. Google Maps API Setup

### Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### Configure Google Maps API
1. Copy your Google Maps API key
2. Open the `.env` file in the admin directory
3. Replace `your_google_maps_api_key_here` with your actual API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY
   ```

## 2. SerpAPI Setup

### Get SerpAPI Key
1. Go to [SerpAPI](https://serpapi.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 100 searches per month

### Configure SerpAPI
1. Copy your SerpAPI key
2. Open the `.env` file in the admin directory
3. Replace `your_serpapi_key_here` with your actual API key:
   ```
   VITE_SERPAPI_KEY=YOUR_ACTUAL_SERPAPI_KEY
   ```

## 3. Environment Configuration

Your `.env` file should look like this:
```
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBvOkBo0QqPVVWz0eUhLdRcW4uQZ1G0XYZ

# SerpAPI Configuration  
VITE_SERPAPI_KEY=12345abcdef67890ghijklmnop

# Default map settings (Delhi coordinates)
VITE_DEFAULT_LAT=28.6139
VITE_DEFAULT_LNG=77.2090
VITE_DEFAULT_ZOOM=12
```

## 4. Features Implemented

### Live Location Tracking
- Real-time updates every 30 seconds
- Tourist location markers with status indicators
- Battery level and speed monitoring

### Places Integration
- Nearby tourist attractions, restaurants, hotels
- Interactive markers with detailed information
- Place ratings and descriptions

### Location-based Alerts
- Live incident monitoring
- News-based alert system
- Area safety status

### Interactive Map Features
- Click to get coordinates
- Zoom and pan controls
- Different marker types for tourists, places, and incidents

## 5. Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the admin dashboard
3. Navigate to a page with the MapComponent
4. The map will automatically load with live data

## 6. Customization

### Change Default Location
Edit the environment variables:
```
VITE_DEFAULT_LAT=YOUR_LATITUDE
VITE_DEFAULT_LNG=YOUR_LONGITUDE
VITE_DEFAULT_ZOOM=YOUR_ZOOM_LEVEL
```

### Modify Update Frequency
In `MapComponent.jsx`, change the interval (currently 30000ms = 30 seconds):
```javascript
}, 30000) // Change this value
```

### Add More Place Types
In `MapComponent.jsx`, modify the search query:
```javascript
'tourist attractions restaurants hotels museums parks'
```

## 7. Troubleshooting

### Map Not Loading
- Check if Google Maps API key is correct
- Ensure APIs are enabled in Google Cloud Console
- Check browser console for errors

### No Places Showing
- Verify SerpAPI key is valid
- Check if you have API quota remaining
- Ensure internet connection is stable

### Location Updates Not Working
- Check browser console for errors
- Verify API keys are correctly set
- Check if SerpAPI quota is exhausted

## 8. Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Restrict API keys to specific domains in production
- Monitor API usage to avoid unexpected charges

## 9. API Limits

### Google Maps API
- Free tier: $200 credit per month
- After free tier: Pay per use

### SerpAPI
- Free tier: 100 searches per month
- Paid plans start at $50/month for 5,000 searches

Make sure to monitor your usage and set up billing alerts to avoid unexpected charges.