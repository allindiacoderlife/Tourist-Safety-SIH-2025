import { Status } from "@googlemaps/react-wrapper";
import { useEffect, useState } from "react";

const GoogleMapWrapper = ({
  center,
  zoom,
  markers,
  onMapClick,
  onAreaSelect,
  onRadiusSelect,
  areaSelectionMode,
  children,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-600 font-medium">
                Google Maps API not configured
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Using enhanced India map simulation
              </p>
              <div className="mt-3">
                <EnhancedIndiaMapComponent
                  center={center}
                  markers={markers}
                  onMapClick={onMapClick}
                  onAreaSelect={onAreaSelect}
                  onRadiusSelect={onRadiusSelect}
                  areaSelectionMode={areaSelectionMode}
                />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Initializing map...</p>
          </div>
        );
    }
  };

  return (
    <EnhancedIndiaMapComponent
      center={center}
      markers={markers}
      onMapClick={onMapClick}
      onAreaSelect={onAreaSelect}
      onRadiusSelect={onRadiusSelect}
      areaSelectionMode={areaSelectionMode}
    />
  );
};

const EnhancedIndiaMapComponent = ({
  center,
  markers,
  onMapClick,
  onAreaSelect,
  onRadiusSelect,
  areaSelectionMode,
}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isDrawingArea, setIsDrawingArea] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [radiusSelection, setRadiusSelection] = useState({
    center: null,
    radius: 1000,
  });
  const [isSelectingRadius, setIsSelectingRadius] = useState(false);

  useEffect(() => {
    setIsDrawingArea(areaSelectionMode);
  }, [areaSelectionMode]);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(selectedMarker?.id === marker.id ? null : marker);
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lat = center.lat + (0.02 * (rect.height / 2 - y)) / (rect.height / 2);
    const lng = center.lng + (0.02 * (x - rect.width / 2)) / (rect.width / 2);

    const clickPoint = { lat, lng, x, y };

    if (isDrawingArea) {
      setDrawingPoints((prev) => [...prev, clickPoint]);
    } else if (isSelectingRadius) {
      const newRadiusSelection = { ...radiusSelection, center: clickPoint };
      setRadiusSelection(newRadiusSelection);
      if (onRadiusSelect) {
        onRadiusSelect(clickPoint, radiusSelection.radius);
      }
      setIsSelectingRadius(false);
    } else {
      if (onMapClick) {
        onMapClick(clickPoint);
      }
      setSelectedMarker(null);
    }
  };

  const completeAreaSelection = () => {
    if (drawingPoints.length >= 3) {
      const area = {
        id: Date.now(),
        points: drawingPoints,
        center: {
          lat:
            drawingPoints.reduce((sum, p) => sum + p.lat, 0) /
            drawingPoints.length,
          lng:
            drawingPoints.reduce((sum, p) => sum + p.lng, 0) /
            drawingPoints.length,
        },
      };
      setSelectedArea(area);
      if (onAreaSelect) {
        onAreaSelect(area);
      }
    }
    setIsDrawingArea(false);
    setDrawingPoints([]);
  };

  const clearAreaSelection = () => {
    setSelectedArea(null);
    setDrawingPoints([]);
    setIsDrawingArea(false);
    if (onAreaSelect) {
      onAreaSelect(null);
    }
  };

  const clearRadiusSelection = () => {
    setRadiusSelection({ center: null, radius: 1000 });
    setIsSelectingRadius(false);
    if (onRadiusSelect) {
      onRadiusSelect(null, 1000);
    }
  };

  const updateRadius = (newRadius) => {
    const newRadiusSelection = { ...radiusSelection, radius: newRadius };
    setRadiusSelection(newRadiusSelection);
    if (radiusSelection.center && onRadiusSelect) {
      onRadiusSelect(radiusSelection.center, newRadius);
    }
  };

  return (
    <div className="h-96 w-full bg-gradient-to-br from-green-100 via-blue-50 to-orange-50 rounded-lg relative overflow-hidden border-2 border-gray-300 shadow-lg">
      {/* Enhanced India map background with realistic geography */}
      <div
        className={`absolute inset-0 ${
          isDrawingArea || isSelectingRadius
            ? "cursor-crosshair"
            : "cursor-pointer"
        }`}
        onClick={handleMapClick}
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23059669' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
            linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(59,130,246,0.1) 50%, rgba(249,115,22,0.1) 100%)
          `,
          backgroundSize: "30px 30px, 100% 100%",
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/3 w-32 h-48 border-2 border-green-400 rounded-tl-3xl rounded-br-3xl transform rotate-12"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-32 border-2 border-blue-400 rounded-full transform -rotate-12"></div>
          <div className="absolute bottom-1/3 left-1/2 w-20 h-20 border-2 border-orange-400 rounded-full"></div>
        </div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-1 bg-blue-300 transform rotate-45 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-1 bg-blue-300 transform -rotate-12 rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/4 w-32 h-1 bg-blue-300 transform rotate-30 rounded-full"></div>
        </div>
        <div className="absolute top-8 left-0 right-0 h-8 bg-gradient-to-b from-gray-300 to-transparent opacity-40"></div>
        {radiusSelection.center && (
          <div
            className="absolute border-2 border-green-500 border-dashed rounded-full bg-green-100 bg-opacity-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${Math.max(
                5,
                Math.min(
                  95,
                  50 + (radiusSelection.center.lng - center.lng) * 2000
                )
              )}%`,
              top: `${Math.max(
                5,
                Math.min(
                  95,
                  50 - (radiusSelection.center.lat - center.lat) * 2000
                )
              )}%`,
              width: `${Math.min(200, radiusSelection.radius / 10)}px`,
              height: `${Math.min(200, radiusSelection.radius / 10)}px`,
            }}
          >
            {/* Center point */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        )}

        {/* Selected Area Visualization */}
        {selectedArea && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polygon
              points={selectedArea.points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="rgba(239, 68, 68, 0.2)"
              stroke="rgba(239, 68, 68, 0.8)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        )}

        {/* Drawing Area Visualization */}
        {isDrawingArea && drawingPoints.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline
              points={drawingPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
            {drawingPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgba(59, 130, 246, 0.8)"
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </svg>
        )}

        {/* Markers with enhanced India-specific styling */}
        {markers?.map((marker, index) => {
          const offsetX = ((marker.lng - center.lng) / 30) * 100;
          const offsetY = -((marker.lat - center.lat) / 20) * 100;

          return (
            <div
              key={marker.id || index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{
                left: `${Math.max(5, Math.min(95, 50 + offsetX))}%`,
                top: `${Math.max(5, Math.min(95, 50 + offsetY))}%`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(marker);
              }}
            >
              <div
                className={`w-6 h-6 rounded-full border-3 border-white shadow-lg transition-all hover:scale-125 ${
                  marker.type === "state"
                    ? "bg-red-500 animate-pulse"
                    : marker.type === "tourist"
                    ? "bg-green-500"
                    : marker.type === "police"
                    ? "bg-blue-500"
                    : "bg-orange-500"
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {marker.type === "state"
                    ? "🏛️"
                    : marker.type === "tourist"
                    ? "🏖️"
                    : marker.type === "police"
                    ? "🚔"
                    : "📍"}
                </div>
              </div>
              {selectedMarker?.id === marker.id && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl border-2 border-orange-200 z-20 min-w-[280px]">
                  <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white p-2 rounded-t-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🇮🇳</span>
                      <span className="font-bold text-sm">
                        Government of India Alert System
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          marker.info || `<strong>${marker.title}</strong>`,
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced map controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 font-bold text-lg">
          +
        </button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 font-bold text-lg">
          −
        </button>
        <button
          onClick={() => setIsDrawingArea(!isDrawingArea)}
          className={`w-10 h-10 rounded-lg shadow-md flex items-center justify-center text-white font-bold text-sm ${
            isDrawingArea
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          title={isDrawingArea ? "Cancel Area Selection" : "Select Area"}
        >
          {isDrawingArea ? "✕" : "⬜"}
        </button>
        <button
          onClick={() => setIsSelectingRadius(!isSelectingRadius)}
          className={`w-10 h-10 rounded-lg shadow-md flex items-center justify-center text-white font-bold text-sm ${
            isSelectingRadius
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
          title={
            isSelectingRadius ? "Cancel Radius Selection" : "Select Radius"
          }
        >
          {isSelectingRadius ? "✕" : "⭕"}
        </button>
      </div>
      {isDrawingArea && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Click to draw area boundary ({drawingPoints.length} points)
          </p>
          <div className="flex space-x-2">
            <button
              onClick={completeAreaSelection}
              disabled={drawingPoints.length < 3}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Complete (
              {drawingPoints.length >= 3
                ? "Ready"
                : "Need " + (3 - drawingPoints.length) + " more"}
              )
            </button>
            <button
              onClick={clearAreaSelection}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {isSelectingRadius && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Click on map to set center point for radius alert
          </p>
          <div className="mb-2">
            <label className="text-xs text-gray-600">
              Radius: {radiusSelection.radius}m
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={radiusSelection.radius}
              onChange={(e) => updateRadius(Number.parseInt(e.target.value))}
              className="w-full mt-1"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsSelectingRadius(false)}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Done
            </button>
            <button
              onClick={clearRadiusSelection}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      {selectedArea && (
        <div className="absolute bottom-4 left-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-red-800 mb-1">
            🎯 Alert Area Selected
          </p>
          <p className="text-xs text-red-600">
            Center: {selectedArea.center.lat.toFixed(4)},{" "}
            {selectedArea.center.lng.toFixed(4)}
          </p>
          <button
            onClick={clearAreaSelection}
            className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Clear Area
          </button>
        </div>
      )}

      {radiusSelection.center && (
        <div className="absolute bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-green-800 mb-1">
            🎯 Radius Alert Selected
          </p>
          <p className="text-xs text-green-600">
            Center: {radiusSelection.center.lat.toFixed(4)},{" "}
            {radiusSelection.center.lng.toFixed(4)}
          </p>
          <p className="text-xs text-green-600">
            Radius: {radiusSelection.radius}m
          </p>
          <button
            onClick={clearRadiusSelection}
            className="mt-2 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
          >
            Clear Radius
          </button>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-100 to-green-100 border-2 border-orange-300 rounded-lg px-4 py-2 shadow-lg">
        <p className="text-sm text-orange-800 font-bold flex items-center">
          <span className="mr-2 text-lg">🇮🇳</span>
          India Emergency Alert System - Real-time Map
        </p>
      </div>
    </div>
  );
};

export default GoogleMapWrapper;