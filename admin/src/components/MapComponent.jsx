import { useState } from "react"

const MapComponent = ({ tourists, jurisdiction }) => {
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredTourists = jurisdiction
    ? tourists.filter((t) => t.jurisdiction === jurisdiction && t.status === "active")
    : tourists.filter((t) => t.status === "active")

  const handleSendAlert = () => {
    if (alertMessage.trim()) {
      alert(`Alert sent to ${filteredTourists.length} tourists: ${alertMessage}`)
      setAlertMessage("")
      setShowAlertForm(false)
    }
  }

  return (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-semibold text-gray-900">
          {jurisdiction ? `${jurisdiction} Area Map` : "Global Tourist Map"}
        </h3>
        <button
          onClick={() => setShowAlertForm(!showAlertForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create Alert
        </button>
      </div>
  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-600">Interactive Map</p>
          <p className="text-sm text-gray-500">Showing {filteredTourists.length} active tourists</p>
        </div>
        {filteredTourists.map((tourist, index) => (
          <div
            key={tourist.id}
            className="absolute w-3 h-3 bg-green-500 rounded-full animate-pulse"
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + index * 10}%`,
            }}
            title={tourist.name}
          />
        ))}
      </div>
      {showAlertForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Send Proactive Alert</h4>
          <textarea
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            placeholder="Enter alert message (e.g., Flash flood warning in this area)"
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleSendAlert}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Send Alert
            </button>
            <button
              onClick={() => setShowAlertForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapComponent