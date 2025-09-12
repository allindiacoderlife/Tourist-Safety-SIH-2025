import { createContext, useContext, useState } from "react"

const mockPoliceStationUsers = [
  {
    id: 1,
    name: "Officer John Smith",
    email: "john@police1.gov",
    password: "police123",
    role: "PoliceStationAdmin",
    station: "Downtown Station",
  },
  {
    id: 2,
    name: "Officer Sarah Johnson",
    email: "sarah@police2.gov",
    password: "police123",
    role: "PoliceStationAdmin",
    station: "North Station",
  },
  {
    id: 3,
    name: "Officer Mike Davis",
    email: "mike@police3.gov",
    password: "police123",
    role: "PoliceStationAdmin",
    station: "South Station",
  },
  {
    id: 4,
    name: "Officer Lisa Wilson",
    email: "lisa@police4.gov",
    password: "police123",
    role: "PoliceStationAdmin",
    station: "East Station",
  },
  {
    id: 5,
    name: "Officer Tom Brown",
    email: "tom@police5.gov",
    password: "police123",
    role: "PoliceStationAdmin",
    station: "West Station",
  },
]

const mockCentralUsers = [
  { id: 1, name: "Central Admin", email: "admin@central.gov", password: "admin123", role: "CentralAdmin" },
]

const mockRegularUsers = [
  { id: 1, name: "Tourist Alice", email: "alice@tourist.com", password: "user123", role: "User" },
  { id: 2, name: "Tourist Bob", email: "bob@tourist.com", password: "user123", role: "User" },
  { id: 3, name: "Tourist Charlie", email: "charlie@tourist.com", password: "user123", role: "User" },
]

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)

  const login = (email, password) => {
    const central = mockCentralUsers.find((c) => c.email === email && c.password === password)
    if (central) {
      const user = {
        id: central.id,
        name: central.name,
        email: central.email,
        role: central.role,
        password: central.password,
      }
      setCurrentUser(user)
      return true
    }

    const policeStation = mockPoliceStationUsers.find((p) => p.email === email && p.password === password)
    if (policeStation) {
      const user = {
        id: policeStation.id,
        name: policeStation.name,
        email: policeStation.email,
        role: policeStation.role,
        password: policeStation.password,
      }
      setCurrentUser(user)
      return true
    }

    const regularUser = mockRegularUsers.find((u) => u.email === email && u.password === password)
    if (regularUser) {
      const user = {
        id: regularUser.id,
        name: regularUser.name,
        email: regularUser.email,
        role: regularUser.role,
        password: regularUser.password,
      }
      setCurrentUser(user)
      return true
    }

    return false
  }

  const logout = () => {
    setCurrentUser(null)
  }
  return (
    <AuthContext.Provider
      value={{
        policeStationUsers: mockPoliceStationUsers,
        centralUsers: mockCentralUsers,
        regularUsers: mockRegularUsers,
        currentUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}