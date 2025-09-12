import { useState } from "react";
import { mockData } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import KPICard from "../../components/KPICard";
import UserDetailsModal from "../../components/UserDetailsModal";
import MapComponent from "../../components/MapComponent";
import AlertsIncidentsList from "../../components/AlertsIncidentsList";
import AlertNotification from "../../components/AlertNotification";

const PoliceStationAdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [alerts, setAlerts] = useState(mockData.alerts);
  const [selectedUser, setSelectedUser] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} onLogout={logout} />
      <AlertNotification
        alerts={alerts.filter((a) => a.jurisdiction === jurisdiction)}
        onAcknowledge={acknowledgeAlert}
      />

      <div className="p-6 space-y-6">
        {/* Local KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title={`Active Tourists in ${jurisdiction}`}
            value={activeTouristsInJurisdiction}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            }
            color="blue"
          />
          <KPICard
            title={`Live Alerts in ${jurisdiction}`}
            value={liveAlertsInJurisdiction}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            }
            color="red"
          />
          <KPICard
            title={`Resolved Incidents in ${jurisdiction}`}
            value={
              typeof jurisdictionData === "object"
                ? jurisdictionData.resolved
                : 0
            }
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            }
            color="green"
          />
        </div>

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