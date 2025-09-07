import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Crowd data points interface
interface CrowdPoint {
  lat: number;
  lng: number;
  intensity: number;
  location: string;
}

// API response interface
interface CrowdDataResponse {
  data: CrowdPoint[];
}

// Fetch crowd data from API
const fetchCrowdData = async (): Promise<CrowdPoint[]> => {
  try {
    console.log('Fetching crowd data from API...');
    const response = await fetch('/api/crowd-data/');
    if (!response.ok) {
      throw new Error(`Failed to fetch crowd data: ${response.status}`);
    }
    const responseText = await response.text();
    console.log('API Response:', responseText);
    
    // Try to parse the response as JSON
    let data: CrowdDataResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Invalid JSON response');
    }
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Unexpected API response format:', data);
      throw new Error('Unexpected API response format');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching crowd data:', error);
    // Fallback to default data if API fails
    return [
      { lat: 40.7589, lng: -73.9851, intensity: 0.9, location: 'Times Square' },
      { lat: 40.7505, lng: -73.9934, intensity: 0.7, location: 'Herald Square' },
    ];
  }
};

interface MapProps {
  onLocationSearch?: (location: string) => void;
}

const Map: React.FC<MapProps> = ({ onLocationSearch }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const heatmapLayers = useRef<L.CircleMarker[]>([]);
  const [crowdData, setCrowdData] = useState<CrowdPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);

  // Fetch crowd data on component mount
  useEffect(() => {
    const loadCrowdData = async () => {
      setIsLoading(true);
      setError(null); // Reset error state before each fetch
      
      try {
        const data = await fetchCrowdData();
        setCrowdData(data);
      } catch (error) {
        console.error('Failed to load crowd data:', error);
        setError('Failed to load crowd data. Using fallback data.');
        // Note: fetchCrowdData already returns fallback data on error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCrowdData();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(loadCrowdData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Loading indicator component
  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border flex items-center gap-3">
        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="text-sm font-medium">Loading crowd data...</span>
      </div>
    </div>
  );
  
  // Error message component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="absolute top-4 right-4 bg-destructive/90 text-destructive-foreground p-3 rounded-lg shadow-lg border border-destructive z-50 max-w-xs">
      <div className="flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Create map
    map.current = L.map(mapContainer.current, {
      center: [40.7589, -73.9851], // Times Square
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Add tile layer with custom styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map.current);

    // Add zoom control to bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update heatmap visualization
  useEffect(() => {
    if (!map.current) return;

    // Clear existing heatmap layers
    heatmapLayers.current.forEach(layer => {
      map.current?.removeLayer(layer);
    });
    heatmapLayers.current = [];

    // Add new heatmap circles
    crowdData.forEach(point => {
      const intensity = point.intensity;
      let color = '#3B82F6'; // Low density (blue)
      let fillOpacity = 0.3;

      if (intensity > 0.7) {
        color = '#EF4444'; // High density (red)
        fillOpacity = 0.6;
      } else if (intensity > 0.5) {
        color = '#F97316'; // Medium-high density (orange)
        fillOpacity = 0.5;
      } else if (intensity > 0.3) {
        color = '#EAB308'; // Medium density (yellow)
        fillOpacity = 0.4;
      }

      const circle = L.circleMarker([point.lat, point.lng], {
        radius: 20 + (intensity * 30),
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: fillOpacity,
        className: intensity > 0.7 ? 'pulse-glow' : '',
      })
        .bindPopup(`
          <div class="text-sm font-medium">${point.location}</div>
          <div class="text-xs text-muted-foreground">
            Crowd Level: ${Math.round(intensity * 100)}%
          </div>
        `)
        .addTo(map.current!);

      heatmapLayers.current.push(circle);
    });
  }, [crowdData]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCrowdData(prevData => 
        prevData.map(point => ({
          ...point,
          intensity: Math.max(0.1, Math.min(1, point.intensity + (Math.random() - 0.5) * 0.1))
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle location search
  const handleLocationSearch = (searchTerm: string) => {
    const foundLocation = crowdData.find(point => 
      point.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (foundLocation && map.current) {
      map.current.setView([foundLocation.lat, foundLocation.lng], 16);
      // Trigger popup
      const layer = heatmapLayers.current.find(layer => {
        const latLng = layer.getLatLng();
        return Math.abs(latLng.lat - foundLocation.lat) < 0.001 && 
               Math.abs(latLng.lng - foundLocation.lng) < 0.001;
      });
      if (layer) {
        layer.openPopup();
      }
    }
    onLocationSearch?.(searchTerm);
  };

  // Expose search function
  useEffect(() => {
    (window as any).searchLocation = handleLocationSearch;
  }, [crowdData]);

  // Center to user location
  const centerToLocation = () => {
    if (navigator.geolocation && map.current) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        map.current?.setView([latitude, longitude], 16);
      }, () => {
        // Fallback to Times Square
        map.current?.setView([40.7589, -73.9851], 14);
      });
    }
  };

  // Expose center function
  useEffect(() => {
    (window as any).centerToLocation = centerToLocation;
  }, []);

  return (
    <motion.div 
      className="relative w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg overflow-hidden z-0"
        style={{ height: '100vh', width: '100vw' }}
      />
      {isLoading && <LoadingOverlay />}
      {error && <ErrorMessage message={error} />}
    </motion.div>
  );
};

export default Map;