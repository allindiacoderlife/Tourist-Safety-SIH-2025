import { useState, useEffect, useRef, useCallback } from "react";
import GoogleMapWrapper from "./GoogleMapWrapper";
import LocationAlertsPanel from "./LocationAlertsPanel";

const MapComponent = ({ tourists, jurisdiction }) => {
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedArea, setSelectedArea] = useState(null);
  const [alertType, setAlertType] = useState("general");
  const [liveLocations, setLiveLocations] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [areaSelectionMode, setAreaSelectionMode] = useState(false);
  const [selectedLocationMethod, setSelectedLocationMethod] = useState("area"); 
  const [radiusSelection, setRadiusSelection] = useState({
    center: null,
    radius: 1000,
  });
  const [mapCenter, setMapCenter] = useState({
    lat: Number.parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 28.6139,
    lng: Number.parseFloat(import.meta.env.VITE_DEFAULT_LNG) || 77.209,
  });
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState("");

  const updateIntervalRef = useRef(null);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setMapCenter(location);
          setLoading(false);
          setError("");
        },
        (error) => {
          console.error("[v0] Error getting location:", error);
          const defaultLocation = { lat: 28.6139, lng: 77.209 };
          setCurrentLocation(defaultLocation);
          setMapCenter(defaultLocation);
          setError(
            "Location access denied. Showing default location (New Delhi)."
          );
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      const defaultLocation = { lat: 28.6139, lng: 77.209 };
      setCurrentLocation(defaultLocation);
      setMapCenter(defaultLocation);
      setError("Geolocation not supported. Showing default location.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (!currentLocation || tourists.length === 0) return;

    const initializeMockData = () => {
      const locations = tourists.map((tourist) => ({
        id: tourist.id,
        lat: currentLocation.lat + (Math.random() - 0.5) * 0.02,
        lng: currentLocation.lng + (Math.random() - 0.5) * 0.02,
        lastUpdate: new Date().toISOString(),
        status: Math.random() > 0.8 ? "alert" : "safe",
        batteryLevel: Math.floor(Math.random() * 40) + 60,
        speed: Math.floor(Math.random() * 20),
      }));
      setLiveLocations(locations);

      const places = [
        {
          id: 1,
          name: "Tourist Information Center",
          address: "Central Delhi",
          rating: 4.5,
          coordinates: {
            lat: currentLocation.lat + 0.005,
            lng: currentLocation.lng + 0.005,
          },
          description: "Government tourist assistance center",
        },
        {
          id: 2,
          name: "Police Station",
          address: "Local Area",
          rating: 4.2,
          coordinates: {
            lat: currentLocation.lat - 0.003,
            lng: currentLocation.lng + 0.007,
          },
          description: "Local police assistance",
        },
        {
          id: 3,
          name: "Emergency Medical Center",
          address: "Healthcare District",
          rating: 4.8,
          coordinates: {
            lat: currentLocation.lat + 0.008,
            lng: currentLocation.lng - 0.004,
          },
          description: "24/7 emergency medical services",
        },
      ];
      setNearbyPlaces(places);
      setLoading(false);
    };

    initializeMockData();
  }, [currentLocation, tourists.length]); 

  useEffect(() => {
    if (liveLocations.length === 0) return;

    updateIntervalRef.current = setInterval(() => {
      setLiveLocations((prevLocations) =>
        prevLocations.map((location) => ({
          ...location,
          lat: location.lat + (Math.random() - 0.5) * 0.001,
          lng: location.lng + (Math.random() - 0.5) * 0.001,
          lastUpdate: new Date().toISOString(),
          batteryLevel: Math.max(
            20,
            location.batteryLevel - Math.floor(Math.random() * 2)
          ),
          speed: Math.floor(Math.random() * 25),
        }))
      );
    }, 30000); 

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [liveLocations.length]);

  const createMarkers = useCallback(() => {
    const markers = [];

    // Add tourist location markers
    liveLocations.forEach((location) => {
      const tourist = tourists.find((t) => t.id === location.id);
      if (tourist) {
        markers.push({
          id: `tourist-${location.id}`,
          lat: location.lat,
          lng: location.lng,
          type: "tourist",
          status: location.status,
          title: tourist.name,
          info: `
            <div class="p-3 min-w-[200px]">
              <h3 class="font-semibold text-gray-900 mb-2">${tourist.name}</h3>
              <div class="space-y-1">
                <p class="text-sm"><span class="font-medium">Status:</span> 
                  <span class="${
                    location.status === "safe"
                      ? "text-green-600"
                      : "text-red-600"
                  } font-medium">
                    ${location.status.toUpperCase()}
                  </span>
                </p>
                <p class="text-sm"><span class="font-medium">Battery:</span> ${
                  location.batteryLevel
                }%</p>
                <p class="text-sm"><span class="font-medium">Speed:</span> ${
                  location.speed
                } km/h</p>
                <p class="text-xs text-gray-500 mt-2">
                  Last update: ${new Date(
                    location.lastUpdate
                  ).toLocaleTimeString()}
                </p>
              </div>
            </div>
          `,
        });
      }
    });

    // Add nearby places markers
    nearbyPlaces.forEach((place) => {
      if (place.coordinates) {
        markers.push({
          id: `place-${place.id}`,
          lat: place.coordinates.lat,
          lng: place.coordinates.lng,
          type: "place",
          title: place.name,
          info: `
            <div class="p-3 min-w-[200px]">
              <h3 class="font-semibold text-gray-900 mb-2">${place.name}</h3>
              <p class="text-sm text-gray-600 mb-1">${place.address}</p>
              ${
                place.rating
                  ? `<p class="text-sm text-amber-600 mb-1">⭐ ${place.rating}/5</p>`
                  : ""
              }
              ${
                place.description
                  ? `<p class="text-xs text-gray-500">${place.description}</p>`
                  : ""
              }
            </div>
          `,
        });
      }
    });

    return markers;
  }, [liveLocations, nearbyPlaces, tourists]);

  const handleMapClick = useCallback(
    (coordinates) => {
      console.log("[v0] Map clicked at:", coordinates);
      if (selectedLocationMethod === "radius") {
        setRadiusSelection({
          center: coordinates,
          radius: radiusSelection.radius,
        });
      }
    },
    [selectedLocationMethod, radiusSelection]
  );

  const handleSendAlert = useCallback(() => {
    if (alertMessage.trim()) {
      const { recipients, recipientCount, alertArea } = getFilteredRecipients();

      const alertData = {
        id: Date.now(),
        message: alertMessage,
        type: alertType,
        timestamp: new Date().toISOString(),
        recipients: recipientCount,
        area: alertArea,
        locationMethod: selectedLocationMethod,
        location: selectedArea
          ? selectedArea.center
          : radiusSelection.center || mapCenter,
        boundary: selectedArea ? selectedArea.points : null,
        radius:
          selectedLocationMethod === "radius" ? radiusSelection.radius : null,
        status: "sent",
        targetedUsers: recipients.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
        })),
      };

      console.log("[v0] Sending location-targeted alert:", alertData);

      // Simulate sending push notifications to targeted users
      recipients.forEach((recipient) => {
        console.log(
          `[v0] Sending alert to ${recipient.name} (${recipient.phone}):`,
          alertMessage
        );
      });

      const locationInfo =
        selectedLocationMethod === "all"
          ? ` to all ${recipientCount} monitored tourists`
          : ` to ${recipientCount} tourists in ${alertArea.toLowerCase()}`;

      alert(
        `🚨 ${alertType.toUpperCase()} ALERT SENT${locationInfo}\n\nMessage: ${alertMessage}\n\nTarget Area: ${alertArea}\n\nRecipients: ${recipientCount} tourists will receive this alert on their phones`
      );

      // Reset form
      setAlertMessage("");
      setAlertType("general");
      setShowAlertForm(false);
      setSelectedLocationMethod("area");
      setSelectedArea(null);
      setRadiusSelection({ center: null, radius: 1000 });
    }
  }, [alertMessage, alertType, tourists, liveLocations, mapCenter]);

  const handleAreaSelect = useCallback((area) => {
    setSelectedArea(area);
    if (area) {
      console.log("[v0] Area selected for alerts:", area);
      setAreaSelectionMode(false); // Exit selection mode after selecting
    }
  }, []);

  const handleRadiusSelect = useCallback((center, radius) => {
    setRadiusSelection({ center, radius });
    console.log("[v0] Radius selected for alerts:", { center, radius });
  }, []);

  const getFilteredRecipients = useCallback(() => {
    let recipients = tourists;
    let recipientCount = tourists.length;
    let alertArea = "All monitored areas";

    if (selectedLocationMethod === "area" && selectedArea) {
      recipients = tourists.filter((tourist) => {
        const touristLocation = liveLocations.find(
          (loc) => loc.id === tourist.id
        );
        if (!touristLocation) return false;
        return isPointInArea(touristLocation, selectedArea);
      });
      recipientCount = recipients.length;
      alertArea = `Selected polygon area (${selectedArea.points.length} boundary points)`;
    } else if (selectedLocationMethod === "radius" && radiusSelection.center) {
      recipients = tourists.filter((tourist) => {
        const touristLocation = liveLocations.find(
          (loc) => loc.id === tourist.id
        );
        if (!touristLocation) return false;
        return isPointInRadius(
          touristLocation,
          radiusSelection.center,
          radiusSelection.radius
        );
      });
      recipientCount = recipients.length;
      alertArea = `${radiusSelection.radius}m radius from selected point`;
    }

    return { recipients, recipientCount, alertArea };
  }, [
    selectedLocationMethod,
    selectedArea,
    radiusSelection,
    tourists,
    liveLocations,
  ]);

  const isPointInArea = (point, area) => {
    if (!area || !area.points || area.points.length < 3) return false;

    const { lat, lng } = point;
    const vertices = area.points;
    let inside = false;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].lat,
        yi = vertices[i].lng;
      const xj = vertices[j].lat,
        yj = vertices[j].lng;

      if (
        yi > lng !== yj > lng &&
        lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }

    return inside;
  };

  const isPointInRadius = (point, center, radius) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point.lat * Math.PI) / 180;
    const φ2 = (center.lat * Math.PI) / 180;
    const Δφ = ((center.lat - point.lat) * Math.PI) / 180;
    const Δλ = ((center.lng - point.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radius;
  };

  const safeCount = liveLocations.filter((l) => l.status === "safe").length;
  const alertCount = liveLocations.filter((l) => l.status === "alert").length;

  return (
    <div className="gov-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {jurisdiction
              ? `${jurisdiction} Area Map`
              : "Tourist Monitoring Map"}
          </h3>
          <p className="text-sm text-gray-600">
            Real-time location tracking and safety monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Live Updates
            </span>
          </div>
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="gov-button-primary px-4 py-2 text-sm font-medium"
          >
            Create Alert
          </button>
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Refresh Location
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="gov-status-safe p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-800">
                Safe Tourists
              </div>
              <div className="text-2xl font-bold text-green-900">
                {safeCount}
              </div>
            </div>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="gov-status-alert p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-800">
                Active Alerts
              </div>
              <div className="text-2xl font-bold text-red-900">
                {alertCount}
              </div>
            </div>
            <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-800">
                Service Points
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {nearbyPlaces.length}
              </div>
            </div>
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-amber-800">
                Total Monitored
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {tourists.length}
              </div>
            </div>
            <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="gov-alert-warning p-3 rounded-lg mb-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading map and live locations...
            </p>
          </div>
        </div>
      ) : (
        <GoogleMapWrapper
          center={mapCenter}
          zoom={Number.parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 12}
          markers={createMarkers()}
          onMapClick={handleMapClick}
          onAreaSelect={handleAreaSelect}
          onRadiusSelect={handleRadiusSelect}
          areaSelectionMode={areaSelectionMode}
        />
      )}
      <div className="mt-6">
        <LocationAlertsPanel
          location={mapCenter}
          onAlertUpdate={(alertCount) =>
            console.log("Alerts updated:", alertCount)
          }
        />
      </div>

      {showAlertForm && (
        <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-amber-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2L3 7v11c0 1.1.9 2 2 2h4v-6h2v6h4c1.1 0 2-.9 2-2V7l-7-5z" />
            </svg>
            Send Location-Based Emergency Alert
            {(selectedArea || radiusSelection.center) && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {selectedLocationMethod === "area"
                  ? "Area Selected"
                  : "Radius Selected"}
              </span>
            )}
          </h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Type
            </label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="general">General Alert</option>
              <option value="weather">Weather Warning</option>
              <option value="security">Security Alert</option>
              <option value="medical">Medical Emergency</option>
              <option value="evacuation">Evacuation Notice</option>
              <option value="traffic">Traffic Advisory</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Location Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedLocationMethod("all")}
                className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                  selectedLocationMethod === "all"
                    ? "bg-blue-100 border-blue-500 text-blue-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  All Areas
                </div>
              </button>
              <button
                onClick={() => {
                  setSelectedLocationMethod("area");
                  setAreaSelectionMode(true);
                }}
                className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                  selectedLocationMethod === "area"
                    ? "bg-red-100 border-red-500 text-red-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Draw Area
                </div>
              </button>
              <button
                onClick={() => setSelectedLocationMethod("radius")}
                className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                  selectedLocationMethod === "radius"
                    ? "bg-green-100 border-green-500 text-green-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Radius
                </div>
              </button>
            </div>
          </div>

          <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Target Location:
              </span>
              {(selectedArea || radiusSelection.center) && (
                <button
                  onClick={() => {
                    setSelectedArea(null);
                    setRadiusSelection({ center: null, radius: 1000 });
                  }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {selectedLocationMethod === "all" && (
              <div className="text-sm text-gray-600">
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  All monitored areas (broadcast to all tourists)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Alert will be sent to all {tourists.length} monitored tourists
                </p>
              </div>
            )}

            {selectedLocationMethod === "area" && (
              <div className="text-sm text-gray-600">
                {selectedArea ? (
                  <div>
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Custom polygon area selected
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Center: {selectedArea.center.lat.toFixed(4)},{" "}
                      {selectedArea.center.lng.toFixed(4)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Alert will target{" "}
                      {getFilteredRecipients().recipientCount} tourists in this
                      area
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Click "Draw Area" and select points on the map to define
                      target area
                    </p>
                    {areaSelectionMode && (
                      <p className="text-xs text-blue-600 mt-1 animate-pulse">
                        🖱️ Area selection mode active - click on the map to draw
                        boundaries
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedLocationMethod === "radius" && (
              <div className="text-sm text-gray-600">
                {radiusSelection.center ? (
                  <div>
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Radius area selected ({radiusSelection.radius}m)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Center: {radiusSelection.center.lat.toFixed(4)},{" "}
                      {radiusSelection.center.lng.toFixed(4)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Alert will target{" "}
                      {getFilteredRecipients().recipientCount} tourists within
                      radius
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Click on the map to set center point, then adjust radius
                    </p>
                    <div className="mt-2">
                      <label className="text-xs text-gray-600">
                        Radius (meters):
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        value={radiusSelection.radius}
                        onChange={(e) =>
                          setRadiusSelection((prev) => ({
                            ...prev,
                            radius: Number.parseInt(e.target.value),
                          }))
                        }
                        className="w-full mt-1"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>100m</span>
                        <span className="font-medium">
                          {radiusSelection.radius}m
                        </span>
                        <span>5km</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <textarea
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            placeholder={`Enter ${alertType} message (e.g., ${getAlertPlaceholder(
              alertType
            )})`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            rows={4}
          />

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Recipients:{" "}
              <span className="font-medium text-green-700">
                {getFilteredRecipients().recipientCount} tourists will receive
                SMS/Push notification
              </span>
              <br />
              <span className="text-xs text-gray-500">
                Target: {getFilteredRecipients().alertArea}
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAlertForm(false);
                  setAreaSelectionMode(false);
                  setSelectedArea(null);
                  setRadiusSelection({ center: null, radius: 1000 });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAlert}
                disabled={!alertMessage.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Send to {getFilteredRecipients().recipientCount} Phones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getAlertPlaceholder = (type) => {
  const placeholders = {
    general: "Important announcement for all tourists in the area",
    weather: "Heavy rainfall expected, seek shelter immediately",
    security: "Avoid this area due to security concerns",
    medical: "Medical emergency services required in this location",
    evacuation: "Immediate evacuation required from this area",
    traffic: "Road closure - use alternative routes",
  };
  return placeholders[type] || "Enter alert message";
};

export default MapComponent;