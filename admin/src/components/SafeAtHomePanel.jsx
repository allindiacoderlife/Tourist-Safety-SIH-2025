import { useState, useEffect } from 'react';

const SafeAtHomePanel = () => {
  // Use mock data only
  const [safeUsers] = useState([
    {
      _id: '1',
      email: 'mock1@email.com',
      phone: '1234567890',
      location: { address: 'Connaught Place, Delhi' },
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      email: 'mock2@email.com',
      phone: '0987654321',
      location: { address: 'Rajiv Chowk, Delhi' },
      updatedAt: new Date().toISOString()
    }
  ]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        "Safe at Home" Notifications
      </h3>
      
      {/* Removed error block: error variable is not defined */}

      <div className="space-y-3">
        {safeUsers.map((user) => (
          <div 
            key={user._id} 
            className="flex items-start p-3 bg-green-50 rounded-lg"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  {user.email}
                </p>
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                  Safe
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Phone: {user.phone}
              </p>
              <p className="text-xs text-gray-500">
                Last location: {user.location.address}
              </p>
              <p className="text-xs text-gray-500">
                Arrived: {new Date(user.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        {safeUsers.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">No recent safe arrivals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeAtHomePanel;