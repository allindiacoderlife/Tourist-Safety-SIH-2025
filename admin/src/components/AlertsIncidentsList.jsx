const AlertsIncidentsList = ({
  alerts,
  tourists,
  jurisdiction,
  onShowUserDetails,
}) => {
  const filteredAlerts = jurisdiction
    ? alerts.filter((alert) => alert.jurisdiction === jurisdiction)
    : alerts;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {jurisdiction ? "Local Alerts & Incidents" : "All Alerts & Incidents"}
      </h3>
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 ${
              alert.type === "panic"
                ? "border-red-500 bg-red-50"
                : "border-orange-500 bg-orange-50"
            }`}
            onClick={() => onShowUserDetails(alert.tourist)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-bold ${
                      alert.type === "panic"
                        ? "text-red-800"
                        : "text-orange-800"
                    }`}
                  >
                    {alert.type === "panic"
                      ? "🚨 PANIC ALERT"
                      : "⚠️ AI ANOMALY"}
                  </span>
                  {alert.acknowledged && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Acknowledged
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>{alert.tourist}</strong> at {alert.location}
                </p>
                <p className="text-xs text-gray-500">{alert.time}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredAlerts.length === 0 && (
          <p className="text-gray-500 text-sm">No active alerts</p>
        )}
      </div>
    </div>
  );
};

export default AlertsIncidentsList;
