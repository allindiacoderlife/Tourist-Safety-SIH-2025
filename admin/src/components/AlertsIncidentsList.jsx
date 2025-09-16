import { useState, useEffect } from 'react';

const AlertsIncidentsList = ({ jurisdiction, onShowUserDetails }) => {
  const [sosAlerts, setSosAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSosAlerts = async () => {
      try {
        const response = await fetch('http://10.68.145.252:7001/sos/');
        const data = await response.json();
        
        if (data.success) {
          setSosAlerts(data.data.sosMessages);
        }
      } catch (err) {
        console.error('Error fetching SOS alerts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSosAlerts();
  }, []);

  const filteredAlerts = jurisdiction
    ? sosAlerts.filter((alert) => alert.location.address.includes(jurisdiction))
    : sosAlerts;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {jurisdiction ? "Local Alerts & Incidents" : "All Alerts & Incidents"}
      </h3>
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading alerts...</p>
        ) : (
          <>
            {filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 ${
                  alert.priority === "critical"
                    ? "border-red-500 bg-red-50"
                    : "border-orange-500 bg-orange-50"
                }`}
                onClick={() => onShowUserDetails({ email: alert.email, phone: alert.phone })}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${
                        alert.priority === "critical" ? "text-red-800" : "text-orange-800"
                      }`}>
                        {alert.emergencyType === "medical" ? "🚑 MEDICAL" : "🚨 SOS"}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.status === "pending" 
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                    <p className="text-sm text-gray-700">
                      Location: {alert.location.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {filteredAlerts.length === 0 && !isLoading && (
              <p className="text-gray-500 text-sm">No active alerts</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AlertsIncidentsList;