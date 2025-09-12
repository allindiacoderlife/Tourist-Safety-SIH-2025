import { useState, useEffect } from "react"
import GoogleMapWrapper from "./GoogleMapWrapper"
import LocationAlertsPanel from "./LocationAlertsPanel"
import serpApiService from "../services/serpApiService"

const MapComponent = ({ tourists, jurisdiction }) => {
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [liveLocations, setLiveLocations] = useState([])
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [mapCenter, setMapCenter] = useState({
    lat: parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 28.6139,
    lng: parseFloat(import.meta.env.VITE_DEFAULT_LNG) || 77.2090
  })
  const [loading, setLoading] = useState(true)

  const filteredTourists = jurisdiction
    ? tourists.filter((t) => t.jurisdiction === jurisdiction && t.status === "active")
    : tourists.filter((t) => t.status === "active")

  // Initialize live location tracking
  useEffect(() => {
    const initializeMap = async () => {
      setLoading(true)
      try {
        // Get live locations for active tourists
        const touristIds = filteredTourists.map(t => t.id)
        const locations = await serpApiService.getLiveLocations(touristIds)
        setLiveLocations(locations)

        // Get nearby places for the center location
        const places = await serpApiService.getNearbyPlaces(
          mapCenter.lat, 
          mapCenter.lng, 
          'tourist attractions restaurants hotels'
        )
        setNearbyPlaces(places)
      } catch (error) {
        console.error('Error initializing map data:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeMap()
  }, [filteredTourists, mapCenter])

  // Set up real-time location updates
  useEffect(() => {
    const updateInterval = setInterval(async () => {
      try {
        const touristIds = filteredTourists.map(t => t.id)
        const updatedLocations = await serpApiService.getLiveLocations(touristIds)
        setLiveLocations(updatedLocations)
      } catch (error) {
        console.error('Error updating live locations:', error)
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(updateInterval)
  }, [filteredTourists])

  // Create markers for the map
  const createMarkers = () => {
    const markers = []

    // Add tourist location markers
    liveLocations.forEach(location => {
      const tourist = filteredTourists.find(t => t.id === location.id)
      if (tourist) {
        markers.push({
          lat: location.lat,
          lng: location.lng,
          type: 'tourist',
          status: location.status,
          title: tourist.name,
          info: `
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${tourist.name}</h3>
              <p class="text-sm text-gray-600">Status: <span class="${location.status === 'safe' ? 'text-green-600' : 'text-red-600'}">${location.status}</span></p>
              <p class="text-sm text-gray-600">Battery: ${location.batteryLevel}%</p>
              <p class="text-sm text-gray-600">Speed: ${location.speed} km/h</p>
              <p class="text-xs text-gray-500">Last update: ${new Date(location.lastUpdate).toLocaleTimeString()}</p>
            </div>
          `
        })
      }
    })

    // Add nearby places markers (limited to first 10)
    nearbyPlaces.slice(0, 10).forEach(place => {
      if (place.coordinates) {
        markers.push({
          lat: place.coordinates.lat,
          lng: place.coordinates.lng,
          type: 'place',
          title: place.name,
          info: `
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${place.name}</h3>
              <p class="text-sm text-gray-600">${place.address}</p>
              ${place.rating ? `<p class="text-sm text-yellow-600">⭐ ${place.rating}</p>` : ''}
              ${place.description ? `<p class="text-xs text-gray-500">${place.description}</p>` : ''}
            </div>
          `
        })
      }
    })

    return markers
  }

  const handleMapClick = (coordinates) => {
    console.log('Map clicked at:', coordinates)
    // You can add functionality here for when the map is clicked
  }

  const handleSendAlert = () => {
    if (alertMessage.trim()) {
      alert(`Alert sent to ${filteredTourists.length} tourists: ${alertMessage}`)
      setAlertMessage("")
      setShowAlertForm(false)
    }
  }

  return (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-semibold text-gray-900">
          {jurisdiction ? `${jurisdiction} Area Map` : "Global Tourist Map"}
        </h3>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create Alert
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* Live Status Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-800">Active Tourists</div>
          <div className="text-2xl font-bold text-green-900">{liveLocations.filter(l => l.status === 'safe').length}</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-red-800">Alerts</div>
          <div className="text-2xl font-bold text-red-900">{liveLocations.filter(l => l.status === 'alert').length}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-800">Places</div>
          <div className="text-2xl font-bold text-blue-900">{nearbyPlaces.length}</div>
        </div>
      </div>
      {loading ? (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading map and live locations...</p>
          </div>
        </div>
      ) : (
        <GoogleMapWrapper
          center={mapCenter}
          zoom={parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 12}
          markers={createMarkers()}
          onMapClick={handleMapClick}
        />
      )}
      
      {/* Location Alerts Panel */}
      <div className="mt-4">
        <LocationAlertsPanel 
          location={mapCenter} 
          onAlertUpdate={(alertCount) => console.log('Alerts updated:', alertCount)}
        />
      </div>
      
      {showAlertForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Send Proactive Alert</h4>
          <textarea
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            placeholder="Enter alert message (e.g., Flash flood warning in this area)"
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleSendAlert}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Send Alert
            </button>
            <button
              onClick={() => setShowAlertForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapComponent