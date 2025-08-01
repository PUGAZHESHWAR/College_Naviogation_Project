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
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const progressMarkerRef = useRef<L.CircleMarker | null>(null);
  const animatedLineRef = useRef<L.Polyline | null>(null);
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<L.LatLng[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isRouteActive, setIsRouteActive] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Set initial view to show more of the campus area
      mapInstanceRef.current = L.map(mapRef.current).setView([12.192850, 79.083730], 17);
      
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
        setView: false, // Don't automatically set view to user location
        maxZoom: 17, // Limit max zoom when locating
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

        // Update progress if navigating (without redrawing the line)
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

  // Function to disable zooming and panning
  const disableMapControls = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.dragging.disable();
      mapInstanceRef.current.touchZoom.disable();
      mapInstanceRef.current.doubleClickZoom.disable();
      mapInstanceRef.current.scrollWheelZoom.disable();
      mapInstanceRef.current.boxZoom.disable();
      mapInstanceRef.current.keyboard.disable();
      mapInstanceRef.current.zoomControl.remove();
    }
  };

  // Function to enable zooming and panning
  const enableMapControls = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.dragging.enable();
      mapInstanceRef.current.touchZoom.enable();
      mapInstanceRef.current.doubleClickZoom.enable();
      mapInstanceRef.current.scrollWheelZoom.enable();
      mapInstanceRef.current.boxZoom.enable();
      mapInstanceRef.current.keyboard.enable();
      mapInstanceRef.current.addControl(L.control.zoom());
    }
  };

  // Function to animate straight line path
  const animateStraightLine = (startPoint: L.LatLng, endPoint: L.LatLng) => {
    if (!mapInstanceRef.current) return;

    // Remove existing animated line
    if (animatedLineRef.current) {
      mapInstanceRef.current.removeLayer(animatedLineRef.current);
    }

    // Create animated line
    animatedLineRef.current = L.polyline([], {
      color: '#3B82F6',
      weight: 6,
      opacity: 0.8,
      smoothFactor: 1
    }).addTo(mapInstanceRef.current);

    // Animate the line drawing
    const totalDistance = startPoint.distanceTo(endPoint);
    const animationDuration = 2000; // 2 seconds
    const animationSteps = 60;
    const stepDuration = animationDuration / animationSteps;

    let currentStep = 0;

    const animate = () => {
      if (currentStep >= animationSteps) {
        // Animation complete
        setIsRouteActive(true);
        disableMapControls();
        return;
      }

      const progress = currentStep / animationSteps;
      const currentDistance = totalDistance * progress;
      
      // Calculate current point along the straight line
      const latDiff = endPoint.lat - startPoint.lat;
      const lngDiff = endPoint.lng - startPoint.lng;
      const currentLat = startPoint.lat + (latDiff * progress);
      const currentLng = startPoint.lng + (lngDiff * progress);
      
      const currentPoint = L.latLng(currentLat, currentLng);
      
      // Update the animated line
      animatedLineRef.current!.setLatLngs([startPoint, currentPoint]);
      
      currentStep++;
      setTimeout(animate, stepDuration);
    };

    animate();
  };

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
      setIsRouteActive(false);
      enableMapControls();
      if (progressMarkerRef.current) {
        mapInstanceRef.current!.removeLayer(progressMarkerRef.current);
      }
      if (animatedLineRef.current) {
        mapInstanceRef.current!.removeLayer(animatedLineRef.current);
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
      if (animatedLineRef.current) {
        mapInstanceRef.current?.removeLayer(animatedLineRef.current);
        animatedLineRef.current = null;
      }
      setIsRouteActive(false);
      enableMapControls();
      return;
    }

    const target = buildings[selectedDestination];
    if (!target) return;

    // Remove existing route layers
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
    }
    if (animatedLineRef.current) {
      mapInstanceRef.current.removeLayer(animatedLineRef.current);
      animatedLineRef.current = null; // Clear the reference
    }

    // Create straight line coordinates
    const startPoint = L.latLng(userLocation.lat, userLocation.lng);
    const endPoint = L.latLng(target.lat, target.lng);
    
    // Store route coordinates for progress tracking
    const straightLineCoords = [startPoint, endPoint];
    setRouteCoordinates(straightLineCoords);
    
    // Animate the straight line
    animateStraightLine(startPoint, endPoint);

    // Enable navigation mode
    setIsNavigating(true);
    setProgressPercentage(0);

    // Set a better map view with appropriate zoom level
    const bounds = L.latLngBounds([startPoint, endPoint]);
    const center = bounds.getCenter();
    const distance = startPoint.distanceTo(endPoint);
    
    // Calculate appropriate zoom level based on distance
    let zoomLevel = 18; // Default zoom
    if (distance > 500) {
      zoomLevel = 16; // Further zoom out for longer distances
    } else if (distance > 200) {
      zoomLevel = 17; // Medium zoom for medium distances
    }
    
    // Set the map view with calculated center and zoom
    mapInstanceRef.current!.setView(center, zoomLevel, {
      animate: true,
      duration: 1.0
    });

  }, [selectedDestination]); // Only depend on selectedDestination, not userLocation

  // Handle initial route creation when both userLocation and destination are available
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !selectedDestination) {
      return;
    }

    const target = buildings[selectedDestination];
    if (!target) return;

    // Only create route if it doesn't exist yet
    if (!animatedLineRef.current) {
      // Remove existing route layers
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
      }
      if (animatedLineRef.current) {
        mapInstanceRef.current.removeLayer(animatedLineRef.current);
      }

      // Create straight line coordinates
      const startPoint = L.latLng(userLocation.lat, userLocation.lng);
      const endPoint = L.latLng(target.lat, target.lng);
      
      // Store route coordinates for progress tracking
      const straightLineCoords = [startPoint, endPoint];
      setRouteCoordinates(straightLineCoords);
      
      // Animate the straight line
      animateStraightLine(startPoint, endPoint);

      // Enable navigation mode
      setIsNavigating(true);
      setProgressPercentage(0);

      // Set a better map view with appropriate zoom level
      const bounds = L.latLngBounds([startPoint, endPoint]);
      const center = bounds.getCenter();
      const distance = startPoint.distanceTo(endPoint);
      
      // Calculate appropriate zoom level based on distance
      let zoomLevel = 18; // Default zoom
      if (distance > 500) {
        zoomLevel = 16; // Further zoom out for longer distances
      } else if (distance > 200) {
        zoomLevel = 17; // Medium zoom for medium distances
      }
      
      // Set the map view with calculated center and zoom
      mapInstanceRef.current!.setView(center, zoomLevel, {
        animate: true,
        duration: 1.0
      });
    }
  }, [userLocation, selectedDestination]); // This effect handles initial route creation

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

      {/* Route Active Indicator */}
      {isRouteActive && (
        <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-blue-500 text-white rounded-lg shadow-lg p-2 md:p-3 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs md:text-sm font-semibold">Route Active</span>
          </div>
          <div className="text-xs opacity-90">Zoom disabled</div>
        </div>
      )}
    </div>
  );
};

export default MapView;