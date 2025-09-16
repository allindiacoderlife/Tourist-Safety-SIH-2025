import { useState, useEffect } from 'react';

const SafeAtHomePanel = () => {
  const [safeUsers, setSafeUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSafeUsers = async () => {
      try {
        const response = await fetch('http://10.68.145.252:7001/sos/?status=safe_home');
        const data = await response.json();
        
        if (data.success) {
          setSafeUsers(data.data.sosMessages);
        } else {
          setError('Failed to fetch safe users');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching safe users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafeUsers();
    const interval = setInterval(fetchSafeUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        "Safe at Home" Notifications
      </h3>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-gray-500">Loading safe arrivals...</p>
          </div>
        ) : (
          <>
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
            {safeUsers.length === 0 && !isLoading && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No recent safe arrivals</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SafeAtHomePanel;