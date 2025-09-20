import { useState } from "react";
import { mockData } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import KPICard from "../../components/KPICard";
import UserDetailsModal from "../../components/UserDetailsModal";
import MapComponent from "../../components/MapComponent";
import AlertsIncidentsList from "../../components/AlertsIncidentsList";
import AlertNotification from "../../components/AlertNotification";

// Import icons from react-icons
import { 
  MdPeople, 
  MdWarning, 
  MdAccountBalance, 
  MdCheckCircle,
  MdClose 
} from "react-icons/md";
import { 
  FaFlag, 
  FaCloudRain, 
  FaShieldAlt, 
  FaAmbulance, 
  FaBullhorn 
} from "react-icons/fa";

const PoliceStationAdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [alerts, setAlerts] = useState(mockData.alerts);
  const [selectedUser, setSelectedUser] = useState(null);
  const [centralAlerts, setCentralAlerts] = useState([
    {
      id: "central_001",
      type: "weather",
      priority: "critical",
      message:
        "Heavy rainfall expected in your jurisdiction. Prepare for potential flooding.",
      location: currentUser?.station || "Local Area",
      time: "5 minutes ago",
      sentBy: "Central Government of India",
      acknowledged: false,
      targetArea: "All Police Stations in Region",
    },
    {
      id: "central_002",
      type: "security",
      priority: "high",
      message: "Increased security alert. Monitor tourist areas closely.",
      location: currentUser?.station || "Local Area",
      time: "15 minutes ago",
      sentBy: "Central Government of India",
      acknowledged: false,
      targetArea: "Tourist Areas",
    },
  ]);

  const acknowledgeAlert = (alertId) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const acknowledgeCentralAlert = (alertId) => {
    setCentralAlerts(
      centralAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const showUserDetails = (touristName) => {
    const tourist = mockData.tourists.find((t) => t.name === touristName);
    setSelectedUser(tourist || null);
  };

  // Helper function to get alert type icon
  const getAlertTypeIcon = (type) => {
    switch (type) {
      case "weather":
        return <FaCloudRain className="w-5 h-5" />;
      case "security":
        return <FaShieldAlt className="w-5 h-5" />;
      case "medical":
        return <FaAmbulance className="w-5 h-5" />;
      default:
        return <FaBullhorn className="w-5 h-5" />;
    }
  };

  if (!currentUser) {
    return null;
  }

  const jurisdiction = currentUser.station;
  const jurisdictionData = mockData.incidents[jurisdiction?.toLowerCase()] || {
    active: 0,
    resolved: 0,
  };
  const activeTouristsInJurisdiction = mockData.tourists.filter(
    (t) => t.jurisdiction === jurisdiction && t.status === "active"
  ).length;
  const liveAlertsInJurisdiction = alerts.filter(
    (a) => a.jurisdiction === jurisdiction && !a.acknowledged
  ).length;
  const unacknowledgedCentralAlerts = centralAlerts.filter(
    (a) => !a.acknowledged
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} onLogout={logout} />
      <AlertNotification
        alerts={alerts.filter((a) => a.jurisdiction === jurisdiction)}
        onAcknowledge={acknowledgeAlert}
      />

      {unacknowledgedCentralAlerts > 0 && (
        <div className="fixed top-20 left-4 z-50 space-y-2">
          {centralAlerts
            .filter((alert) => !alert.acknowledged)
            .map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg shadow-lg border-l-4 max-w-sm gov-emergency-alert ${
                  alert.priority === "critical"
                    ? "bg-red-50 border-red-500"
                    : alert.priority === "high"
                    ? "bg-orange-50 border-orange-500"
                    : "bg-yellow-50 border-yellow-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4
                      className={`font-bold flex items-center ${
                        alert.priority === "critical"
                          ? "text-red-800"
                          : alert.priority === "high"
                          ? "text-orange-800"
                          : "text-yellow-800"
                      }`}
                    >
                      <FaFlag className="mr-2" />
                      CENTRAL GOVERNMENT ALERT
                      {alert.priority === "critical" && (
                        <MdWarning className="ml-2 animate-pulse" />
                      )}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      From: {alert.sentBy} • Target: {alert.targetArea}
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                      {alert.message}
                    </p>
                    <p className="text-sm text-gray-700">
                      Area: {alert.location}
                    </p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                  <button
                    onClick={() => acknowledgeCentralAlert(alert.id)}
                    className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50 font-medium flex items-center"
                  >
                    <MdCheckCircle className="mr-1" />
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            title={`Active Tourists in ${jurisdiction}`}
            value={activeTouristsInJurisdiction}
            icon={<MdPeople className="w-6 h-6" />}
          />
          <KPICard
            title={`Live Alerts in ${jurisdiction}`}
            value={liveAlertsInJurisdiction}
            icon={<MdWarning className="w-6 h-6" />}
            color="red"
          />
          <KPICard
            title="Central Gov Alerts"
            value={unacknowledgedCentralAlerts}
            icon={<MdAccountBalance className="w-6 h-6" />}
            color="yellow"
          />
          <KPICard
            title={`Resolved Incidents in ${jurisdiction}`}
            value={
              typeof jurisdictionData === "object"
                ? jurisdictionData.resolved
                : 0
            }
            icon={<MdCheckCircle className="w-6 h-6" />}
            color="green"
          />
        </div>

        {centralAlerts.length > 0 && (
          <div className="gov-india-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaFlag className="mr-2" />
                Central Government Alerts
                {unacknowledgedCentralAlerts > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
                    {unacknowledgedCentralAlerts} New
                  </span>
                )}
              </h3>
              <div className="text-sm text-gray-600">
                Station: {jurisdiction}
              </div>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {centralAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.acknowledged
                      ? "bg-gray-50 border-gray-300 opacity-60"
                      : alert.priority === "critical"
                      ? "bg-red-50 border-red-500"
                      : alert.priority === "high"
                      ? "bg-orange-50 border-orange-500"
                      : "bg-yellow-50 border-yellow-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`text-sm font-bold flex items-center ${
                            alert.priority === "critical"
                              ? "text-red-800"
                              : alert.priority === "high"
                              ? "text-orange-800"
                              : "text-yellow-800"
                          }`}
                        >
                          {getAlertTypeIcon(alert.type)}
                          <span className="ml-1">
                            {alert.type === "weather"
                              ? "WEATHER"
                              : alert.type === "security"
                              ? "SECURITY"
                              : alert.type === "medical"
                              ? "MEDICAL"
                              : "GENERAL"}
                          </span>
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            alert.priority === "critical"
                              ? "bg-red-100 text-red-800"
                              : alert.priority === "high"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {alert.priority.toUpperCase()}
                        </span>
                        {alert.acknowledged && (
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 flex items-center">
                            <MdCheckCircle className="mr-1" />
                            ACKNOWLEDGED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        <strong>From:</strong> {alert.sentBy} •{" "}
                        <strong>Target:</strong> {alert.targetArea}
                      </p>
                      <p className="text-xs text-gray-500">{alert.time}</p>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeCentralAlert(alert.id)}
                        className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-medium flex items-center"
                      >
                        <MdCheckCircle className="mr-1" />
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <MapComponent
              tourists={mockData.tourists}
              jurisdiction={jurisdiction}
            />
          </div>

          <div className="space-y-6">
            <AlertsIncidentsList
              alerts={alerts}
              tourists={mockData.tourists}
              jurisdiction={jurisdiction}
              onShowUserDetails={showUserDetails}
            />
          </div>
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default PoliceStationAdminDashboard;