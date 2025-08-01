import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildings } from '../data/buildings';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
});

interface MapViewProps {
  selectedDestination: string;
  onLocationUpdate?: (location: L.LatLng) => void;
}

const MapView: React.FC<MapViewProps> = ({ selectedDestination, onLocationUpdate }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const routeControlRef = useRef<any>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const progressMarkerRef = useRef<L.CircleMarker | null>(null);
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<L.LatLng[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([12.192850, 79.083730], 18);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 22,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add building markers
      Object.entries(buildings).forEach(([key, building]) => {
        L.marker([building.lat, building.lng])
          .addTo(mapInstanceRef.current!)
          .bindPopup(`<strong>${building.name}</strong>`);
      });

      // Location handling with high accuracy and continuous updates
      mapInstanceRef.current.locate({ 
        setView: true, 
        maxZoom: 18, 
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 1000, // Update every second
        timeout: 10000
      });
      
      mapInstanceRef.current.on('locationfound', (e) => {
        const location = e.latlng;
        setUserLocation(location);
        onLocationUpdate?.(location);

        // Update or create user marker
        if (userMarkerRef.current) {
          mapInstanceRef.current!.removeLayer(userMarkerRef.current);
        }
        
        userMarkerRef.current = L.circleMarker(location, {
          radius: 12,
          fillColor: '#3B82F6',
          color: '#1E40AF',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(mapInstanceRef.current!).bindPopup('📍 You are here').openPopup();

        // Update progress if navigating
        if (isNavigating && routeCoordinates.length > 0) {
          updateProgressAlongRoute(location);
        }
      });

      mapInstanceRef.current.on('locationerror', () => {
        console.warn('Could not detect your current location.');
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onLocationUpdate]);

  // Function to update progress along the route
  const updateProgressAlongRoute = (currentLocation: L.LatLng) => {
    if (routeCoordinates.length === 0) return;

    // Find the closest point on the route
    let minDistance = Infinity;
    let closestIndex = 0;

    routeCoordinates.forEach((coord, index) => {
      const distance = currentLocation.distanceTo(coord);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Calculate progress percentage
    const progress = (closestIndex / (routeCoordinates.length - 1)) * 100;
    setProgressPercentage(Math.min(progress, 100));

    // Update progress marker
    if (progressMarkerRef.current) {
      mapInstanceRef.current!.removeLayer(progressMarkerRef.current);
    }

    if (closestIndex < routeCoordinates.length) {
      progressMarkerRef.current = L.circleMarker(routeCoordinates[closestIndex], {
        radius: 8,
        fillColor: '#10B981',
        color: '#059669',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapInstanceRef.current!).bindPopup(`🎯 Progress: ${Math.round(progress)}%`);
    }

    // Check if user is close to destination
    const target = buildings[selectedDestination];
    if (target && currentLocation.distanceTo(L.latLng(target.lat, target.lng)) < 50) {
      // User has reached destination
      setIsNavigating(false);
      if (progressMarkerRef.current) {
        mapInstanceRef.current!.removeLayer(progressMarkerRef.current);
      }
    }
  };

  // Handle destination routing
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !selectedDestination) {
      // Remove existing route
      if (routeLayerRef.current) {
        mapInstanceRef.current?.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      return;
    }

    const target = buildings[selectedDestination];
    if (!target) return;

    // Remove existing route layer
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
    }

    // Create route using OSRM API directly
    const startCoord = `${userLocation.lng},${userLocation.lat}`;
    const endCoord = `${target.lng},${target.lat}`;
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord};${endCoord}?overview=full&geometries=geojson`;

    fetch(routeUrl)
      .then(response => response.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          
          // Store route coordinates for progress tracking
          const routeLatLngs = coordinates.map((coord: [number, number]) => L.latLng(coord[0], coord[1]));
          setRouteCoordinates(routeLatLngs);
          
          // Create polyline for the route
          routeLayerRef.current = L.polyline(coordinates, {
            color: '#3B82F6',
            weight: 6,
            opacity: 0.8,
            smoothFactor: 1
          }).addTo(mapInstanceRef.current!);

          // Enable navigation mode
          setIsNavigating(true);
          setProgressPercentage(0);

          // Fit map to show the entire route
          const group = new L.FeatureGroup([
            L.marker([userLocation.lat, userLocation.lng]),
            L.marker([target.lat, target.lng]),
            routeLayerRef.current
          ]);
          mapInstanceRef.current!.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      })
      .catch(error => {
        console.error('Error fetching route:', error);
        // Fallback: draw straight line
        routeLayerRef.current = L.polyline([
          [userLocation.lat, userLocation.lng],
          [target.lat, target.lng]
        ], {
          color: '#3B82F6',
          weight: 4,
          opacity: 0.6,
          dashArray: '10, 10'
        }).addTo(mapInstanceRef.current!);
      });

  }, [selectedDestination, userLocation]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Live Progress Indicator */}
      {isNavigating && selectedDestination && (
        <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white rounded-lg shadow-lg p-3 md:p-4 border border-gray-200 z-10 max-w-xs">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="w-2 md:w-3 h-2 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs md:text-sm font-semibold text-gray-800">Live Navigation</span>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-32 md:w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            <div className="truncate">Destination: {buildings[selectedDestination]?.name}</div>
            <div>Status: {progressPercentage >= 100 ? 'Arrived!' : 'Navigating...'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;