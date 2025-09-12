import { useEffect, useState } from 'react';

const AlertNotification = () => {
  const [sosAlerts, setSosAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSosAlerts = async () => {
      try {
        const response = await fetch('http://10.68.145.252:7001/sos/');
        const data = await response.json();
        
        if (data.success) {
          setSosAlerts(data.data.sosMessages.filter(msg => msg.status === 'pending'));
        }
      } catch (err) {
        console.error('Error fetching SOS alerts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSosAlerts();
    const interval = setInterval(fetchSosAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (sosId) => {
    try {
      const response = await fetch(`http://10.68.145.252:7001/api/sos/${sosId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'acknowledged' }),
      });

      if (response.ok) {
        setSosAlerts(prev => prev.filter(alert => alert._id !== sosId));
      }
    } catch (err) {
      console.error('Error acknowledging SOS:', err);
    }
  };

  if (isLoading || sosAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {sosAlerts.map((alert) => (
        <div
          key={alert._id}
          className={`p-4 rounded-lg shadow-lg border-l-4 ${
            alert.priority === "critical"
              ? "bg-red-50 border-red-500"
              : "bg-orange-50 border-orange-500"
          } max-w-sm`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className={`font-bold ${
                alert.priority === "critical" ? "text-red-800" : "text-orange-800"
              }`}>
                {alert.emergencyType === "medical" ? "🚑 MEDICAL EMERGENCY" : "🚨 SOS ALERT"}
              </h4>
              <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
              <p className="text-sm text-gray-700">
                Location: {alert.location.address}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleAcknowledge(alert._id)}
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