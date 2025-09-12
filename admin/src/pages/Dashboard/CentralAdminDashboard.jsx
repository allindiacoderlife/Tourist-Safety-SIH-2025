import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { mockData } from "../../data/mockData"
import Header from "../../components/Header"
import KPICard from "../../components/KPICard"
import AlertNotification from "../../components/AlertNotification"
import UserDetailsModal from "../../components/UserDetailsModal"
import MapComponent from "../../components/MapComponent"
import SafeAtHomePanel from "../../components/SafeAtHomePanel"
import AdminManagementTable from "../../components/AdminManagementTable"
import AlertsIncidentsList from "../../components/AlertsIncidentsList"

const CentralAdminDashboard = () => {
  const { currentUser, logout } = useAuth()
  const [alerts, setAlerts] = useState(mockData.alerts)
  const [selectedUser, setSelectedUser] = useState(null)

  const acknowledgeAlert = (alertId) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  const showUserDetails = (touristName) => {
    const tourist = mockData.tourists.find((t) => t.name === touristName)
    setSelectedUser(tourist || null)
  }

  const activeTourists = mockData.tourists.filter((t) => t.status === "active").length
  const activeAdmins = mockData.admins.filter((a) => a.status === "active").length
  const liveAlerts = alerts.filter((a) => !a.acknowledged).length

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} onLogout={logout} />
      <AlertNotification alerts={alerts} onAcknowledge={acknowledgeAlert} />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Active Tourists"
            value={activeTourists}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            }
            color="blue"
          />
          <KPICard
            title="Active Police Admins"
            value={activeAdmins}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <KPICard
            title="Live Alert Count"
            value={liveAlerts}
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
            title="Total Resolved Incidents"
            value={mockData.incidents.resolved}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MapComponent tourists={mockData.tourists} />
            <AdminManagementTable admins={mockData.admins} />
          </div>
          <div className="space-y-6">
            <SafeAtHomePanel tourists={mockData.tourists} />
            <AlertsIncidentsList alerts={alerts} tourists={mockData.tourists} onShowUserDetails={showUserDetails} />
          </div>
        </div>
      </div>

      {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  )
}

export default CentralAdminDashboard