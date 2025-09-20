import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { mockData } from "../../data/mockData";
import { MdPeople, MdCheckCircle, MdWarning, MdForward, MdAccountBalance } from "react-icons/md";
import Header from "../../components/Header";
import AlertNotification from "../../components/AlertNotification";
import IndiaMapComponent from "../../components/IndiaMapComponent";
import AdminManagementTable from "../../components/AdminManagementTable";
import IncomingAlertsPanel from "../../components/IncomingAlertsPanel";
import SafeAtHomePanel from "../../components/SafeAtHomePanel";
import AlertsIncidentsList from "../../components/AlertsIncidentsList";
import UserDetailsModal from "../../components/UserDetailsModal";

const CentralAdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [alerts, setAlerts] = useState(mockData.alerts);
  const [selectedUser, setSelectedUser] = useState(null);
  const [forwardedAlerts, setForwardedAlerts] = useState([]);
  const [selectedIncomingAlert, setSelectedIncomingAlert] = useState(null);

  const acknowledgeAlert = (alertId) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const showUserDetails = (touristName) => {
    const tourist = mockData.tourists.find((t) => t.name === touristName);
    setSelectedUser(tourist || null);
  };

  const handleForwardAlert = (incomingAlert) => {
    setSelectedIncomingAlert(incomingAlert);
    const newAlert = {
      id: `forwarded_${Date.now()}`,
      type: incomingAlert.type,
      priority:
        incomingAlert.severity === "critical"
          ? "critical"
          : incomingAlert.severity === "high"
          ? "high"
          : "normal",
      message: incomingAlert.message,
      location: incomingAlert.affectedAreas[0], 
      timestamp: new Date().toISOString(),
      source: `Forwarded from ${incomingAlert.department}`,
      originalAlert: incomingAlert,
      acknowledged: false,
      status: "pending_broadcast",
    };

    setForwardedAlerts((prev) => [...prev, newAlert]);
    setAlerts((prev) => [...prev, newAlert]);
    alert(
      `Alert forwarded successfully!\n\nFrom: ${
        incomingAlert.department
      }\nTo: All citizens and police stations in ${incomingAlert.affectedAreas.join(
        ", "
      )}\n\nThe alert will be broadcast immediately to all registered phones and emergency services in the affected areas.`
    );
  };

  const activeTourists = mockData.tourists.filter(
    (t) => t.status === "active"
  ).length;
  const activeAdmins = mockData.admins.filter(
    (a) => a.status === "active"
  ).length;
  const liveAlerts = alerts.filter((a) => !a.acknowledged).length;
  const forwardedAlertsCount = forwardedAlerts.length;

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} onLogout={logout} />
      <AlertNotification alerts={alerts} onAcknowledge={acknowledgeAlert} />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            title="Total Active Tourists"
            value={activeTourists}
            icon={<MdPeople className="w-6 h-6" />}
            color="blue"
          />
          <KPICard
            title="Active Police Admins"
            value={activeAdmins}
            icon={<MdAccountBalance className="w-6 h-6" />}
            color="green"
          />
          <KPICard
            title="Live Alert Count"
            value={liveAlerts}
            icon={<MdWarning className="w-6 h-6" />}
            color="red"
          />
          <KPICard
            title="Forwarded Alerts"
            value={forwardedAlertsCount}
            icon={<MdForward className="w-6 h-6" />}
            color="purple"
          />
          <KPICard
            title="Total Resolved Incidents"
            value={mockData.incidents.resolved}
            icon={<MdCheckCircle className="w-6 h-6" />}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <IndiaMapComponent />
            <AdminManagementTable admins={mockData.admins} />
          </div>
          <div className="xl:col-span-1 space-y-6">
            <IncomingAlertsPanel onForwardAlert={handleForwardAlert} />
          </div>
          <div className="xl:col-span-1 space-y-6">
            <SafeAtHomePanel tourists={mockData.tourists} />
            <AlertsIncidentsList
              alerts={alerts}
              tourists={mockData.tourists}
              onShowUserDetails={showUserDetails}
            />
          </div>
        </div>

        {forwardedAlerts.length > 0 && (
          <div className="gov-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📤</span>
              Recently Forwarded Alerts
            </h2>
            <div className="space-y-3">
              {forwardedAlerts.slice(-5).map((alert) => (
                <div
                  key={alert.id}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-green-800">
                        {alert.originalAlert?.title}
                      </h3>
                      <p className="text-sm text-green-600 mt-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-green-700">
                        <span className="mr-4">📍 {alert.location}</span>
                        <span className="mr-4">
                          🏛️ {alert.originalAlert?.department}
                        </span>
                        <span>
                          ⏰ {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium">Broadcasted</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default CentralAdminDashboard;