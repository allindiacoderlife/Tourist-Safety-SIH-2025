const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

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
            <label className="text-sm font-medium text-gray-600">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Phone Number</label>
            <p className="text-gray-900">{user.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Last Known Location</label>
            <p className="text-gray-900">{user.location?.address || 'Not available'}</p>
          </div>
          {user.emergencyType && (
            <div>
              <label className="text-sm font-medium text-gray-600">Emergency Type</label>
              <p className="text-gray-900">{user.emergencyType}</p>
            </div>
          )}
          {user.message && (
            <div>
              <label className="text-sm font-medium text-gray-600">Last Message</label>
              <p className="text-gray-900">{user.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;