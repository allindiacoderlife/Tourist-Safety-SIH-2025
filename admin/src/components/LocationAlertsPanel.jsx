import { useState, useEffect, useCallback } from "react";
import serpApiService from "../services/serpApiService";

const LocationAlertsPanel = ({ location, onAlertUpdate }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLocationAlerts = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    try {
      const locationName = `${location.lat},${location.lng}`;
      const alertsData = await serpApiService.getLocationAlerts(locationName);
      setAlerts(alertsData);
      if (onAlertUpdate) {
        onAlertUpdate(alertsData.length);
      }
    } catch (error) {
      console.error("Error fetching location alerts:", error);
    } finally {
      setLoading(false);
    }
  }, [location, onAlertUpdate]);

  useEffect(() => {
    fetchLocationAlerts();
  }, [fetchLocationAlerts]);

  if (loading) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="animate-pulse">
          <div className="font-medium text-yellow-800 mb-2">
            Loading Alerts...
          </div>
          <div className="h-4 bg-yellow-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="font-medium text-green-800">✅ No Active Alerts</div>
        <p className="text-sm text-green-600">Area appears to be safe</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 p-4 rounded-lg">
      <div className="font-medium text-red-800 mb-2">
        ⚠️ {alerts.length} Active Alert{alerts.length > 1 ? "s" : ""}
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {alerts.map((alert, index) => (
          <div key={alert.id || index} className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{alert.snippet}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{alert.source}</span>
              <span className="text-xs text-gray-500">{alert.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationAlertsPanel;