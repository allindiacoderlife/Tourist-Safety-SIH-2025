const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <p className="text-gray-900">{user.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Phone Number</label>
            <p className="text-gray-900">{user.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
            <p className="text-gray-900">{user.emergencyContact}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Last Known Location</label>
            <p className="text-gray-900">{user.jurisdiction}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Trip Itinerary</label>
            <p className="text-gray-900">{user.itinerary}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailsModal