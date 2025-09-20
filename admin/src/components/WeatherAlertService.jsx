import { useState, useEffect } from "react";

const WeatherAlertService = ({ onWeatherAlert }) => {
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchWeatherData = async (location) => {
    try {
      setLoading(true);
      const mockWeatherResponse = {
        location: location,
        current: {
          temperature: Math.floor(Math.random() * 15) + 25, 
          humidity: Math.floor(Math.random() * 30) + 60, 
          windSpeed: Math.floor(Math.random() * 20) + 5, 
          conditions: ["Clear", "Cloudy", "Rainy", "Stormy"][
            Math.floor(Math.random() * 4)
          ],
        },
        alerts: [],
        forecast: [],
      };

      if (mockWeatherResponse.current.conditions === "Stormy") {
        mockWeatherResponse.alerts.push({
          id: `weather_${Date.now()}`,
          type: "weather",
          severity: "high",
          title: `Severe Weather Alert - ${location}`,
          message: `Severe thunderstorm with heavy rainfall and strong winds expected in ${location}. Tourists advised to stay indoors.`,
          validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          department: "India Meteorological Department (IMD)",
        });
      }

      if (mockWeatherResponse.current.temperature > 38) {
        mockWeatherResponse.alerts.push({
          id: `heatwave_${Date.now()}`,
          type: "weather",
          severity: "medium",
          title: `Heat Wave Warning - ${location}`,
          message: `Extreme heat conditions in ${location}. Temperature expected to reach ${mockWeatherResponse.current.temperature}°C. Stay hydrated and avoid outdoor activities.`,
          validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          department: "India Meteorological Department (IMD)",
        });
      }

      setWeatherData((prev) => ({
        ...prev,
        [location]: mockWeatherResponse,
      }));

      mockWeatherResponse.alerts.forEach((alert) => {
        if (onWeatherAlert) {
          onWeatherAlert({
            ...alert,
            affectedAreas: [location],
            coordinates: getLocationCoordinates(location),
            source: "IMD Weather Station",
            timestamp: new Date().toISOString(),
          });
        }
      });
    } catch (error) {
      console.error("[v0] Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationCoordinates = (location) => {
    const coordinates = {
      Delhi: { lat: 28.6139, lng: 77.209 },
      Mumbai: { lat: 19.076, lng: 72.8777 },
      Kolkata: { lat: 22.5726, lng: 88.3639 },
      Chennai: { lat: 13.0827, lng: 80.2707 },
      Bangalore: { lat: 12.9716, lng: 77.5946 },
      Goa: { lat: 15.2993, lng: 74.124 },
      Agra: { lat: 27.1751, lng: 78.0421 },
      Jaipur: { lat: 26.9124, lng: 75.7873 },
    };
    return coordinates[location] || { lat: 20.5937, lng: 78.9629 };
  };

  useEffect(() => {
    const majorLocations = [
      "Delhi",
      "Mumbai",
      "Goa",
      "Agra",
      "Jaipur",
      "Kolkata",
      "Chennai",
      "Bangalore",
    ];

    const fetchAllWeatherData = () => {
      majorLocations.forEach((location) => {
        setTimeout(() => fetchWeatherData(location), Math.random() * 5000);
      });
    };

    fetchAllWeatherData();
    const interval = setInterval(fetchAllWeatherData, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default WeatherAlertService;