import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import LoginPage from "./pages/Auth/LoginPage"
import CentralAdminDashboard from "./pages/Dashboard/CentralAdminDashboard"
import ProtectedRoute from "./context/ProtectedRoute"
import PoliceStationAdminDashboard from "./pages/Dashboard/PoliceStationAdminDashboard"

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/central-admin"
          element={
            <ProtectedRoute allowedRoles={["CentralAdmin"]}>
              <CentralAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-admin"
          element={
            <ProtectedRoute allowedRoles={["PoliceStationAdmin"]}>
              <PoliceStationAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/unauthorized"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
                <p className="text-gray-600">You don't have permission to access this page.</p>
              </div>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App