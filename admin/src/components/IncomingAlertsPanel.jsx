import { useState, useEffect, useCallback } from "react";
import { FaCloudRain, FaShieldAlt, FaHospitalAlt, FaTrafficLight, FaBullhorn } from "react-icons/fa";

const IncomingAlertsPanel = ({ onForwardAlert }) => {
  const [incomingAlerts, setIncomingAlerts] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(false);

  // Mock weather API service
  const fetchWeatherAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const mockWeatherAlerts = [
        {
          id: `weather_${Date.now()}`,
          type: "weather",
          department: "India Meteorological Department (IMD)",
          severity: "high",
          title: "Cyclone Warning - Bay of Bengal",
          message:
            "Severe cyclonic storm approaching Odisha and West Bengal coast. Expected landfall in 24 hours.",
          affectedAreas: ["Odisha", "West Bengal", "Kolkata"],
          timestamp: new Date().toISOString(),
          coordinates: { lat: 22.5726, lng: 88.3639 },
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          source: "IMD Weather Station",
          priority: "critical",
        },
        {
          id: `weather_${Date.now() + 1}`,
          type: "weather",
          department: "India Meteorological Department (IMD)",
          severity: "medium",
          title: "Heavy Rainfall Alert - Mumbai",
          message:
            "Heavy to very heavy rainfall expected in Mumbai and surrounding areas for next 48 hours.",
          affectedAreas: ["Mumbai", "Maharashtra"],
          timestamp: new Date().toISOString(),
          coordinates: { lat: 19.076, lng: 72.8777 },
          validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          source: "IMD Regional Center Mumbai",
          priority: "high",
        },
      ];

      setIncomingAlerts((prev) => [...prev, ...mockWeatherAlerts]);
    } catch (error) {
      console.error("[v0] Error fetching weather alerts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSecurityAlerts = useCallback(async () => {
    const mockSecurityAlerts = [
      {
        id: `security_${Date.now()}`,
        type: "security",
        department: "Ministry of Home Affairs",
        severity: "high",
        title: "Security Alert - Tourist Areas",
        message:
          "Increased security measures in popular tourist destinations due to intelligence inputs.",
        affectedAreas: ["Delhi", "Agra (Taj Mahal)", "Jaipur"],
        timestamp: new Date().toISOString(),
        coordinates: { lat: 28.6139, lng: 77.209 },
        validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        source: "Central Intelligence Bureau",
        priority: "high",
      },
    ];

    setIncomingAlerts((prev) => [...prev, ...mockSecurityAlerts]);
  }, []);

  const fetchHealthAlerts = useCallback(async () => {
    const mockHealthAlerts = [
      {
        id: `health_${Date.now()}`,
        type: "health",
        department: "Ministry of Health & Family Welfare",
        severity: "medium",
        title: "Health Advisory - Dengue Outbreak",
        message:
          "Increased dengue cases reported in Delhi NCR. Tourists advised to take precautionary measures.",
        affectedAreas: ["Delhi", "Gurgaon", "Noida"],
        timestamp: new Date().toISOString(),
        coordinates: { lat: 28.6139, lng: 77.209 },
        validUntil: new Date(Date.now() + 168 * 60 * 60 * 1000).toISOString(),
        source: "National Center for Disease Control",
        priority: "normal",
      },
    ];

    setIncomingAlerts((prev) => [...prev, ...mockHealthAlerts]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomType = Math.random();
      if (randomType < 0.4) {
        fetchWeatherAlerts();
      } else if (randomType < 0.7) {
        fetchSecurityAlerts();
      } else {
        fetchHealthAlerts();
      }
    }, 30000); 

    fetchWeatherAlerts();
    setTimeout(fetchSecurityAlerts, 5000);
    setTimeout(fetchHealthAlerts, 10000);

    return () => clearInterval(interval);
  }, [fetchWeatherAlerts, fetchSecurityAlerts, fetchHealthAlerts]);

  const handleForwardAlert = (alert) => {
    if (onForwardAlert) {
      onForwardAlert(alert);
    }
  };

  const dismissAlert = (alertId) => {
    setIncomingAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 border-red-500 text-red-800";
      case "high":
        return "bg-orange-100 border-orange-500 text-orange-800";
      case "medium":
        return "bg-yellow-100 border-yellow-500 text-yellow-800";
      default:
        return "bg-blue-100 border-blue-500 text-blue-800";
    }
  };

  const getDepartmentIcon = (type) => {
    switch (type) {
      case "weather":
        return <FaCloudRain className="w-5 h-5" />;
      case "security":
        return <FaShieldAlt className="w-5 h-5" />;
      case "health":
        return <FaHospitalAlt className="w-5 h-5" />;
      case "traffic":
        return <FaTrafficLight className="w-5 h-5" />;
      default:
        return <FaBullhorn className="w-5 h-5" />;
    }
  };

  return (
    <div className="gov-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">📨</span>
            Incoming Department Alerts
          </h2>
          <p className="text-gray-600">
            Real-time alerts from various government departments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              Active Alerts
            </div>
            <div className="text-lg font-bold text-red-600">
              {incomingAlerts.length}
            </div>
          </div>
          {loading && (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-800">Critical</div>
              <div className="text-2xl font-bold text-red-900">
                {incomingAlerts.filter((a) => a.severity === "critical").length}
              </div>
            </div>
            <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
              <span className="text-red-600">🚨</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-orange-800">
                High Priority
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {incomingAlerts.filter((a) => a.severity === "high").length}
              </div>
            </div>
            <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
              <span className="text-orange-600">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-yellow-800">Medium</div>
              <div className="text-2xl font-bold text-yellow-900">
                {incomingAlerts.filter((a) => a.severity === "medium").length}
              </div>
            </div>
            <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">⚡</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-800">Normal</div>
              <div className="text-2xl font-bold text-blue-900">
                {
                  incomingAlerts.filter(
                    (a) => a.severity === "normal" || !a.severity
                  ).length
                }
              </div>
            </div>
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-blue-600">ℹ️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {incomingAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No incoming alerts at the moment</p>
            <p className="text-sm">Monitoring all government departments...</p>
          </div>
        ) : (
          incomingAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg p-4 ${getSeverityColor(
                alert.severity
              )} transition-all hover:shadow-md`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {getDepartmentIcon(alert.type)}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg">{alert.title}</h3>
                    <p className="text-sm opacity-75">{alert.department}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleForwardAlert(alert)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium"
                  >
                    Forward Alert
                  </button>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <p className="mb-3 text-sm leading-relaxed">{alert.message}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-medium">Affected Areas:</span>
                  <div className="mt-1">
                    {alert.affectedAreas.map((area, index) => (
                      <span
                        key={index}
                        className="inline-block bg-white bg-opacity-50 px-2 py-1 rounded mr-1 mb-1"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div>
                    <span className="font-medium">Source:</span> {alert.source}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>{" "}
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Valid Until:</span>{" "}
                    {new Date(alert.validUntil).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncomingAlertsPanel;