import axios from 'axios'

// SerpAPI service for location and places data
class SerpAPIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_SERPAPI_KEY
    this.baseUrl = 'https://serpapi.com/search.json'
  }

  // Get places near a specific location
  async getNearbyPlaces(lat, lng, query = 'tourist attractions', radius = 5000) {
    try {
      const params = {
        engine: 'google_maps',
        q: query,
        ll: `@${lat},${lng},${radius}m`,
        type: 'search',
        api_key: this.apiKey
      }

      const response = await axios.get(this.baseUrl, { params })
      return this.formatPlacesData(response.data)
    } catch (error) {
      console.error('Error fetching nearby places:', error)
      return []
    }
  }

  // Get local search results for a location
  async getLocalSearch(location, query = 'restaurants hotels attractions') {
    try {
      const params = {
        engine: 'google',
        q: `${query} near ${location}`,
        location: location,
        google_domain: 'google.com',
        gl: 'in',
        hl: 'en',
        api_key: this.apiKey
      }

      const response = await axios.get(this.baseUrl, { params })
      return this.formatSearchData(response.data)
    } catch (error) {
      console.error('Error fetching local search:', error)
      return []
    }
  }

  // Get real-time traffic and location data
  async getLocationInfo(lat, lng) {
    try {
      const params = {
        engine: 'google_maps',
        q: `${lat},${lng}`,
        type: 'place',
        api_key: this.apiKey
      }

      const response = await axios.get(this.baseUrl, { params })
      return this.formatLocationData(response.data)
    } catch (error) {
      console.error('Error fetching location info:', error)
      return null
    }
  }

  // Get live incidents and alerts for a location
  async getLocationAlerts(location) {
    try {
      const params = {
        engine: 'google',
        q: `traffic accidents incidents alerts ${location}`,
        location: location,
        tbm: 'nws', // News search
        tbs: 'qdr:d', // Last day
        api_key: this.apiKey
      }

      const response = await axios.get(this.baseUrl, { params })
      return this.formatAlertsData(response.data)
    } catch (error) {
      console.error('Error fetching location alerts:', error)
      return []
    }
  }

  // Format places data from SerpAPI response
  formatPlacesData(data) {
    if (!data.local_results) return []

    return data.local_results.map(place => ({
      id: place.place_id || place.position,
      name: place.title,
      address: place.address,
      rating: place.rating,
      type: place.type || 'place',
      coordinates: place.gps_coordinates || null,
      hours: place.hours,
      phone: place.phone,
      website: place.website,
      description: place.description || place.snippet,
      thumbnail: place.thumbnail
    }))
  }

  // Format search data from SerpAPI response
  formatSearchData(data) {
    if (!data.organic_results) return []

    return data.organic_results.slice(0, 10).map(result => ({
      id: result.position,
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      source: result.source
    }))
  }

  // Format location data from SerpAPI response
  formatLocationData(data) {
    if (!data.place_results) return null

    const place = data.place_results
    return {
      name: place.title,
      address: place.address,
      coordinates: place.gps_coordinates,
      rating: place.rating,
      hours: place.hours,
      phone: place.phone,
      website: place.website,
      photos: place.photos || [],
      reviews_count: place.reviews,
      price_level: place.price_level
    }
  }

  // Format alerts data from SerpAPI response
  formatAlertsData(data) {
    if (!data.news_results) return []

    return data.news_results.slice(0, 5).map(alert => ({
      id: alert.position,
      title: alert.title,
      snippet: alert.snippet,
      source: alert.source,
      date: alert.date,
      link: alert.link,
      thumbnail: alert.thumbnail
    }))
  }

  // Simulate live location updates (in real app, this would connect to real-time APIs)
  async getLiveLocations(touristIds) {
    // Simulate API call with mock data that changes over time
    return touristIds.map(id => ({
      id,
      lat: 28.6139 + (Math.random() - 0.5) * 0.1, // Random coordinates around Delhi
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
      lastUpdate: new Date().toISOString(),
      status: Math.random() > 0.1 ? 'safe' : 'alert', // 90% safe, 10% alert
      batteryLevel: Math.floor(Math.random() * 100),
      speed: Math.floor(Math.random() * 50) // km/h
    }))
  }
}

export default new SerpAPIService()