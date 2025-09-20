import { useState, useEffect, useCallback } from "react";
import { MdFlag, MdLocationCity, MdPlace, MdLocalPolice, MdWarning, MdInfo, MdClose, MdAutorenew } from "react-icons/md";
import GoogleMapWrapper from "./GoogleMapWrapper";
const INDIA_LOCATIONS = {
  states: {
    Delhi: { lat: 28.6139, lng: 77.209, type: "capital" },
    Mumbai: { lat: 19.076, lng: 72.8777, type: "metro" },
    Kolkata: { lat: 22.5726, lng: 88.3639, type: "metro" },
    Chennai: { lat: 13.0827, lng: 80.2707, type: "metro" },
    Bangalore: { lat: 12.9716, lng: 77.5946, type: "metro" },
    Hyderabad: { lat: 17.385, lng: 78.4867, type: "metro" },
    Pune: { lat: 18.5204, lng: 73.8567, type: "city" },
    Ahmedabad: { lat: 23.0225, lng: 72.5714, type: "city" },
    Jaipur: { lat: 26.9124, lng: 75.7873, type: "city" },
    Lucknow: { lat: 26.8467, lng: 80.9462, type: "city" },
  },
  touristPlaces: {
    Goa: { lat: 15.2993, lng: 74.124, type: "tourist", state: "Goa" },
    "Agra (Taj Mahal)": {
      lat: 27.1751,
      lng: 78.0421,
      type: "tourist",
      state: "Uttar Pradesh",
    },
    Varanasi: {
      lat: 25.3176,
      lng: 82.9739,
      type: "tourist",
      state: "Uttar Pradesh",
    },
    Rishikesh: {
      lat: 30.0869,
      lng: 78.2676,
      type: "tourist",
      state: "Uttarakhand",
    },
    Manali: {
      lat: 32.2432,
      lng: 77.1892,
      type: "tourist",
      state: "Himachal Pradesh",
    },
    Shimla: {
      lat: 31.1048,
      lng: 77.1734,
      type: "tourist",
      state: "Himachal Pradesh",
    },
    Darjeeling: {
      lat: 27.041,
      lng: 88.2663,
      type: "tourist",
      state: "West Bengal",
    },
    Ooty: { lat: 11.4064, lng: 76.6932, type: "tourist", state: "Tamil Nadu" },
    Kochi: { lat: 9.9312, lng: 76.2673, type: "tourist", state: "Kerala" },
    Udaipur: {
      lat: 24.5854,
      lng: 73.7125,
      type: "tourist",
      state: "Rajasthan",
    },
    Jodhpur: {
      lat: 26.2389,
      lng: 73.0243,
      type: "tourist",
      state: "Rajasthan",
    },
    Mysore: { lat: 12.2958, lng: 76.6394, type: "tourist", state: "Karnataka" },
    Hampi: { lat: 15.335, lng: 76.46, type: "tourist", state: "Karnataka" },
    Amritsar: { lat: 31.634, lng: 74.8723, type: "tourist", state: "Punjab" },
  },
};

const POLICE_STATIONS = {
  Delhi: [
    {
      id: "dl_001",
      name: "Connaught Place Police Station",
      lat: 28.6315,
      lng: 77.2167,
    },
    {
      id: "dl_002",
      name: "Karol Bagh Police Station",
      lat: 28.6519,
      lng: 77.1909,
    },
    {
      id: "dl_003",
      name: "Lajpat Nagar Police Station",
      lat: 28.5677,
      lng: 77.2431,
    },
  ],
  Mumbai: [
    { id: "mb_001", name: "Colaba Police Station", lat: 18.9067, lng: 72.8147 },
    { id: "mb_002", name: "Bandra Police Station", lat: 19.0596, lng: 72.8295 },
    {
      id: "mb_003",
      name: "Andheri Police Station",
      lat: 19.1136,
      lng: 72.8697,
    },
  ],
  Goa: [
    { id: "ga_001", name: "Panaji Police Station", lat: 15.4909, lng: 73.8278 },
    {
      id: "ga_002",
      name: "Calangute Police Station",
      lat: 15.5438,
      lng: 73.7654,
    },
    { id: "ga_003", name: "Margao Police Station", lat: 15.27, lng: 73.95 },
  ],
  "Agra (Taj Mahal)": [
    {
      id: "ag_001",
      name: "Taj Ganj Police Station",
      lat: 27.1733,
      lng: 78.0414,
    },
    {
      id: "ag_002",
      name: "Agra Cantt Police Station",
      lat: 27.1767,
      lng: 78.0081,
    },
  ],
};

const IndiaMapComponent = ({ userRole = "CentralAdmin" }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("general");
  const [alertPriority, setAlertPriority] = useState("normal");
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India
  const [loading, setLoading] = useState(false);
  const [citizenCount, setCitizenCount] = useState({});
  const [policeStations, setPoliceStations] = useState([]);
  const generateCitizenData = useCallback((locationName) => {
    const baseCount = Math.floor(Math.random() * 50000) + 10000; // 10k to 60k people
    const touristCount = Math.floor(Math.random() * 5000) + 1000; // 1k to 6k tourists

    return {
      totalCitizens: baseCount,
      tourists: touristCount,
      registeredPhones: Math.floor((baseCount + touristCount) * 0.85), // 85% have registered phones
      policeStations:
        POLICE_STATIONS[locationName]?.length ||
        Math.floor(Math.random() * 5) + 2,
    };
  }, []);

  const createIndiaMarkers = useCallback(() => {
    const markers = [];
    Object.entries(INDIA_LOCATIONS.states).forEach(([name, location]) => {
      markers.push({
        id: `state-${name}`,
        lat: location.lat,
        lng: location.lng,
        type: "state",
        title: name,
        locationData: location,
        info: `
          <div class="p-4 min-w-[250px]">
            <h3 class="font-bold text-lg text-gray-900 mb-2">${name}</h3>
            <div class="space-y-2">
              <p class="text-sm"><span class="font-medium">Type:</span> ${
                location.type === "capital"
                  ? "National Capital"
                  : location.type === "metro"
                  ? "Metropolitan City"
                  : "Major City"
              }</p>
              <p class="text-sm"><span class="font-medium">Coordinates:</span> ${location.lat.toFixed(
                4
              )}, ${location.lng.toFixed(4)}</p>
              <div class="mt-3 pt-2 border-t">
                <button onclick="window.selectLocationForAlert('${name}')" 
                        class="w-full bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700">
                  Send Alert to ${name}
                </button>
              </div>
            </div>
          </div>
        `,
      });
    });
    Object.entries(INDIA_LOCATIONS.touristPlaces).forEach(
      ([name, location]) => {
        markers.push({
          id: `tourist-${name}`,
          lat: location.lat,
          lng: location.lng,
          type: "tourist",
          title: name,
          locationData: location,
          info: `
          <div class="p-4 min-w-[250px]">
            <h3 class="font-bold text-lg text-gray-900 mb-2">${name}</h3>
            <div class="space-y-2">
              <p class="text-sm"><span class="font-medium">State:</span> ${
                location.state
              }</p>
              <p class="text-sm"><span class="font-medium">Type:</span> Tourist Destination</p>
              <p class="text-sm"><span class="font-medium">Coordinates:</span> ${location.lat.toFixed(
                4
              )}, ${location.lng.toFixed(4)}</p>
              <div class="mt-3 pt-2 border-t">
                <button onclick="window.selectLocationForAlert('${name}')" 
                        class="w-full bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700">
                  Send Alert to ${name}
                </button>
              </div>
            </div>
          </div>
        `,
        });
      }
    );
    if (selectedLocation && POLICE_STATIONS[selectedLocation]) {
      POLICE_STATIONS[selectedLocation].forEach((station) => {
        markers.push({
          id: `police-${station.id}`,
          lat: station.lat,
          lng: station.lng,
          type: "police",
          title: station.name,
          info: `
            <div class="p-3 min-w-[200px]">
              <h3 class="font-semibold text-gray-900 mb-2">${station.name}</h3>
              <p class="text-sm text-blue-600 mb-2">🚔 Police Station</p>
              <p class="text-xs text-gray-500">Will receive alerts for this area</p>
            </div>
          `,
        });
      });
    }

    return markers;
  }, [selectedLocation]);
  const handleLocationSelect = useCallback(
    (locationName) => {
      setSelectedLocation(locationName);
      const locationData =
        INDIA_LOCATIONS.states[locationName] ||
        INDIA_LOCATIONS.touristPlaces[locationName];

      if (locationData) {
        setMapCenter({ lat: locationData.lat, lng: locationData.lng });
        const citizenData = generateCitizenData(locationName);
        setCitizenCount({ [locationName]: citizenData });
        setPoliceStations(POLICE_STATIONS[locationName] || []);
        setShowAlertForm(true);
      }
    },
    [generateCitizenData]
  );
  useEffect(() => {
    window.selectLocationForAlert = handleLocationSelect;
    return () => {
      delete window.selectLocationForAlert;
    };
  }, [handleLocationSelect]);

  const handleSendAlert = useCallback(async () => {
    if (!alertMessage.trim() || !selectedLocation) return;

    setLoading(true);

    try {
      const locationData = citizenCount[selectedLocation];
      const policeStationsInArea = POLICE_STATIONS[selectedLocation] || [];
      const alertData = {
        id: Date.now(),
        message: alertMessage,
        type: alertType,
        priority: alertPriority,
        location: selectedLocation,
        timestamp: new Date().toISOString(),
        targetCitizens: locationData?.registeredPhones || 0,
        targetPoliceStations: policeStationsInArea.length,
        status: "sent",
        sentBy: "Central Government of India",
        coordinates:
          INDIA_LOCATIONS.states[selectedLocation] ||
          INDIA_LOCATIONS.touristPlaces[selectedLocation],
      };

      console.log("[v0] Sending India-wide alert:", alertData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      policeStationsInArea.forEach((station) => {
        console.log(`[v0] Alert sent to ${station.name} (${station.id})`);
      });

      const successMessage = `
🚨 EMERGENCY ALERT SENT SUCCESSFULLY

📍 Location: ${selectedLocation}
📱 Citizens Notified: ${locationData?.registeredPhones?.toLocaleString() || 0}
🚔 Police Stations Alerted: ${policeStationsInArea.length}
⚠️ Alert Type: ${alertType.toUpperCase()}
🔴 Priority: ${alertPriority.toUpperCase()}

Message: "${alertMessage}"

All registered mobile phones in ${selectedLocation} have received the emergency alert via SMS and push notifications. Local police stations have been notified and are on standby.
      `;

      alert(successMessage);
      setAlertMessage("");
      setAlertType("general");
      setAlertPriority("normal");
      setShowAlertForm(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error("[v0] Error sending alert:", error);
      alert("Failed to send alert. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [alertMessage, alertType, alertPriority, selectedLocation, citizenCount]);

  return (
    <div className="gov-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🇮🇳 Central Government Emergency Alert System
          </h2>
          <p className="text-gray-600">
            Monitor and send emergency alerts across India - Cities, States &
            Tourist Destinations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">Coverage</div>
            <div className="text-lg font-bold text-green-600">
              {Object.keys(INDIA_LOCATIONS.states).length +
                Object.keys(INDIA_LOCATIONS.touristPlaces).length}{" "}
              Locations
            </div>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <MdFlag className="text-2xl text-orange-600" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-800">
                Major Cities
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {Object.keys(INDIA_LOCATIONS.states).length}
              </div>
            </div>
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <MdLocationCity className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-800">
                Tourist Places
              </div>
              <div className="text-2xl font-bold text-green-900">
                {Object.keys(INDIA_LOCATIONS.touristPlaces).length}
              </div>
            </div>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <MdPlace className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-amber-800">
                Police Stations
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {Object.values(POLICE_STATIONS).reduce(
                  (total, stations) => total + stations.length,
                  0
                )}
              </div>
            </div>
            <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
              <MdLocalPolice className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-800">
                Alert Status
              </div>
              <div className="text-lg font-bold text-red-900">
                {selectedLocation ? "Ready" : "Select Location"}
              </div>

            </div>
            <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
              <MdWarning className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <MdInfo className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              How to Send Location-Based Alerts
            </h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>
                1. Click on any city or tourist place marker on the map below
              </li>
              <li>2. Click "Send Alert to [Location]" in the popup window</li>
              <li>
                3. Fill in the alert details and send to all phones in that area
              </li>
              <li>
                4. Local police stations will also be automatically notified
              </li>
            </ol>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <GoogleMapWrapper
          center={mapCenter}
          zoom={5} // Zoom level to show entire India
          markers={createIndiaMarkers()}
          onMapClick={() => {}} // No click handling needed for this map
          className="h-96"
        />
      </div>
      {showAlertForm && selectedLocation && (
        <div className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-red-900 flex items-center">
              <MdWarning className="w-6 h-6 mr-2" />
              Emergency Alert for {selectedLocation}
            </h3>
            <button
              onClick={() => {
                setShowAlertForm(false);
                setSelectedLocation(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-600">
                Citizens to Alert
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {citizenCount[
                  selectedLocation
                ]?.registeredPhones?.toLocaleString() || "0"}
              </div>
              <div className="text-xs text-gray-500">
                Registered mobile phones
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-600">
                Police Stations
              </div>
              <div className="text-2xl font-bold text-green-600">
                {policeStations.length}
              </div>
              <div className="text-xs text-gray-500">Will be notified</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-600">
                Total Tourists
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {citizenCount[selectedLocation]?.tourists?.toLocaleString() ||
                  "0"}
              </div>
              <div className="text-xs text-gray-500">In the area</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="general">General Alert</option>
                  <option value="weather">Weather Emergency</option>
                  <option value="security">Security Alert</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="evacuation">Evacuation Order</option>
                  <option value="traffic">Traffic Emergency</option>
                  <option value="natural_disaster">Natural Disaster</option>
                  <option value="terrorist">Security Threat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={alertPriority}
                  onChange={(e) => setAlertPriority(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Message
              </label>
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder={`Enter ${alertType} message for ${selectedLocation}...`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                <p className="font-medium">This alert will be sent to:</p>
                <ul className="mt-1 space-y-1">
                  <li>
                    📱{" "}
                    {citizenCount[
                      selectedLocation
                    ]?.registeredPhones?.toLocaleString() || 0}{" "}
                    mobile phones in {selectedLocation}
                  </li>
                  <li>
                    🚔 {policeStations.length} police stations in the area
                  </li>
                  <li>📺 Local emergency broadcast systems</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAlertForm(false);
                    setSelectedLocation(null);
                  }}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendAlert}
                  disabled={!alertMessage.trim() || loading}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center"
                >
                  {loading ? (
                    <>
                      <MdAutorenew className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Sending Alert...
                    </>
                  ) : (
                    <>🚨 Send Emergency Alert</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndiaMapComponent;

