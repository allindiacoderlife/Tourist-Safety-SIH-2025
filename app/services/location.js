// Location services for Tourist Safety App
import * as Location from 'expo-location';

export class LocationService {
  /**
   * Request location permissions
   * @returns {Promise<boolean>} - Permission granted status
   */
  static async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Get current location
   * @returns {Promise<object>} - Current location data
   */
  static async getCurrentLocation() {
    try {
      // Check permission first
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      return {
        success: true,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        },
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Get location failed:', error);
      return {
        success: false,
        error: error.message,
        coordinates: null,
      };
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<object>} - Address information
   */
  static async getAddressFromCoordinates(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        return {
          success: true,
          address: {
            street: address.street,
            city: address.city,
            region: address.region,
            country: address.country,
            postalCode: address.postalCode,
            formattedAddress: `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ','),
          },
        };
      } else {
        return {
          success: false,
          error: 'No address found for coordinates',
          address: null,
        };
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        success: false,
        error: error.message,
        address: null,
      };
    }
  }

  /**
   * Get formatted location string for SOS alerts
   * @returns {Promise<string>} - Formatted location string
   */
  static async getFormattedLocationForSOS() {
    try {
      const locationResult = await this.getCurrentLocation();
      
      if (!locationResult.success) {
        return 'Location unavailable';
      }

      const { latitude, longitude } = locationResult.coordinates;
      
      // Try to get address
      const addressResult = await this.getAddressFromCoordinates(latitude, longitude);
      
      if (addressResult.success) {
        return `${addressResult.address.formattedAddress} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
      } else {
        return `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    } catch (error) {
      console.error('Format location failed:', error);
      return 'Location unavailable';
    }
  }

  /**
   * Generate Google Maps link for coordinates
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {string} - Google Maps URL
   */
  static getGoogleMapsLink(latitude, longitude) {
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }

  /**
   * Get location data formatted for SOS API
   * @returns {Promise<object>} - Location data for SOS
   */
  static async getSOSLocationData() {
    try {
      const locationResult = await this.getCurrentLocation();
      
      if (!locationResult.success) {
        return {
          location: 'Location unavailable',
          coordinates: null,
          mapsLink: null,
          accuracy: null,
        };
      }

      const { latitude, longitude, accuracy } = locationResult.coordinates;
      const formattedLocation = await this.getFormattedLocationForSOS();
      const mapsLink = this.getGoogleMapsLink(latitude, longitude);

      return {
        location: formattedLocation,
        coordinates: {
          latitude,
          longitude,
        },
        mapsLink,
        accuracy: accuracy ? Math.round(accuracy) : null,
        timestamp: locationResult.timestamp,
      };
    } catch (error) {
      console.error('Get SOS location data failed:', error);
      return {
        location: 'Location error occurred',
        coordinates: null,
        mapsLink: null,
        accuracy: null,
      };
    }
  }
}

export default LocationService;