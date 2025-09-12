import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { useEffect, useRef, useState } from 'react'

// Google Maps Wrapper Component
const GoogleMapWrapper = ({ center, zoom, markers, onMapClick, children }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        )
      case Status.FAILURE:
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-600">Error loading Google Maps</p>
              <p className="text-sm text-gray-500">Please check your API key</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        )
    }
  }

  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🔑</div>
          <p className="text-gray-600">Google Maps API Key Required</p>
          <p className="text-sm text-gray-500">Please add your API key to .env file</p>
        </div>
      </div>
    )
  }

  return (
    <Wrapper apiKey={apiKey} render={render}>
      <GoogleMapComponent
        center={center}
        zoom={zoom}
        markers={markers}
        onMapClick={onMapClick}
      >
        {children}
      </GoogleMapComponent>
    </Wrapper>
  )
}

// Core Google Maps Component
const GoogleMapComponent = ({ center, zoom, markers, onMapClick, children }) => {
  const ref = useRef()
  const [map, setMap] = useState()
  const [mapMarkers, setMapMarkers] = useState([])

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      })

      // Add click listener
      if (onMapClick) {
        newMap.addListener('click', (e) => {
          onMapClick({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          })
        })
      }

      setMap(newMap)
    }
  }, [ref, map, center, zoom, onMapClick])

  // Update markers when props change
  useEffect(() => {
    if (map && markers) {
      // Clear existing markers
      mapMarkers.forEach(marker => marker.setMap(null))

      // Add new markers
      const newMarkers = markers.map(markerData => {
        const marker = new window.google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map,
          title: markerData.title || markerData.name,
          icon: getMarkerIcon(markerData.type, markerData.status)
        })

        // Add info window if content provided
        if (markerData.info) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: markerData.info
          })

          marker.addListener('click', () => {
            infoWindow.open(map, marker)
          })
        }

        return marker
      })

      setMapMarkers(newMarkers)
    }
  }, [map, markers, mapMarkers])

  // Helper function to get marker icon based on type and status
  const getMarkerIcon = (type, status) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/'
    
    if (type === 'tourist') {
      return status === 'safe' 
        ? baseUrl + 'green-dot.png' 
        : status === 'alert' 
        ? baseUrl + 'red-dot.png'
        : baseUrl + 'yellow-dot.png'
    } else if (type === 'place') {
      return baseUrl + 'blue-dot.png'
    } else if (type === 'incident') {
      return baseUrl + 'orange-dot.png'
    }
    
    return null // Default marker
  }

  return (
    <div className="h-96 w-full">
      <div ref={ref} className="h-full w-full rounded-lg" />
      {children}
    </div>
  )
}

export default GoogleMapWrapper