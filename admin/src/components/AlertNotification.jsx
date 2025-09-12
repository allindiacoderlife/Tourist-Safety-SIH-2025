const AlertNotification = ({ alerts, onAcknowledge }) => {
  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged);

  if (unacknowledgedAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {unacknowledgedAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 ${
            alert.type === "panic"
              ? "bg-red-50 border-red-500"
              : "bg-orange-50 border-orange-500"
          } max-w-sm`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4
                className={`font-bold ${
                  alert.type === "panic" ? "text-red-800" : "text-orange-800"
                }`}
              >
                {alert.type === "panic" ? "🚨 PANIC ALERT" : "⚠️ AI ANOMALY"}
              </h4>
              <p className="text-sm text-gray-700">
                {alert.tourist} at {alert.location}
              </p>
              <p className="text-xs text-gray-500">{alert.time}</p>
            </div>
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50"
            >
              Acknowledge
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertNotification;
