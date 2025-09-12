const SafeAtHomePanel = ({ tourists }) => {
  const safeAtHomeTourists = tourists.filter((t) => t.status === "safe_home")

  return (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">"Safe at Home" Notifications</h3>
      <div className="space-y-3">
        {safeAtHomeTourists.map((tourist) => (
          <div key={tourist.id} className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {tourist.name} has completed their tour and is inactive.
              </p>
              <p className="text-xs text-gray-500">Last location: {tourist.jurisdiction}</p>
            </div>
          </div>
        ))}
        {safeAtHomeTourists.length === 0 && (
          <p className="text-gray-500 text-sm">No recent safe arrivals</p>
        )}
      </div>
    </div>
  )
}

export default SafeAtHomePanel