import { useState, useEffect, useRef } from "react"

const MapComponent = ({ tourists, jurisdiction }) => {
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const mapRef = useRef(null)
  const googleMapRef = useRef(null)
  const markersRef = useRef([])

  const filteredTourists = jurisdiction
    ? tourists.filter((t) => t.jurisdiction === jurisdiction && t.status === "active")
    : tourists.filter((t) => t.status === "active")
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setIsLoading(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            setCurrentLocation({ lat: 20.5937, lng: 78.9629 }); 
            setError("Location access denied. Showing default location.");
            setIsLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        setError("Geolocation is not supported by this browser");
        setCurrentLocation({ lat: 20.5937, lng: 78.9629 });
        setIsLoading(false);
      }
    };

    getCurrentLocation();
  }, []);
  useEffect(() => {
    if (!currentLocation || !window.google) return;

    try {
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: jurisdiction ? 12 : 5,
          center: currentLocation,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          mapTypeId: 'roadmap'
        });
        new window.google.maps.Marker({
          position: currentLocation,
          map: googleMapRef.current,
          title: "Your Location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          }
        });
      }
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      filteredTourists.forEach((tourist) => {
        const position = {
          lat: tourist.latitude || currentLocation.lat,
          lng: tourist.longitude || currentLocation.lng,
        };

        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: tourist.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#22C55E",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          }
        });

        marker.addListener("click", () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-3">
                <h3 class="font-bold text-lg mb-2">${tourist.name}</h3>
                <p class="text-sm"><strong>Status:</strong> ${tourist.status}</p>
                <p class="text-sm"><strong>Location:</strong> ${tourist.jurisdiction}</p>
              </div>
            `
          });
          infoWindow.open(googleMapRef.current, marker);
        });

        markersRef.current.push(marker);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please refresh the page.");
    }
  }, [tourists, jurisdiction, currentLocation]);

  const handleSendAlert = () => {
    if (alertMessage.trim()) {
      alert(`Alert sent to ${filteredTourists.length} tourists: ${alertMessage}`);
      setAlertMessage("");
      setShowAlertForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {jurisdiction ? `${jurisdiction} Area Map` : "Global Tourist Map"}
        </h3>
        <button
          onClick={() => setShowAlertForm(!showAlertForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create Alert
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="h-96 w-full rounded-lg relative"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
            <div className="text-gray-600">Loading map...</div>
          </div>
        )}
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
  );
};

export default MapComponent;