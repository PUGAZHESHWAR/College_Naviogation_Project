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
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);

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

      // Location handling
      mapInstanceRef.current.locate({ setView: true, maxZoom: 18, watch: true });
      
      mapInstanceRef.current.on('locationfound', (e) => {
        const location = e.latlng;
        setUserLocation(location);
        onLocationUpdate?.(location);

        // Update or create user marker
        if (userMarkerRef.current) {
          mapInstanceRef.current!.removeLayer(userMarkerRef.current);
        }
        
        userMarkerRef.current = L.circleMarker(location, {
          radius: 10,
          fillColor: '#3B82F6',
          color: '#1E40AF',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstanceRef.current!).bindPopup('📍 You are here').openPopup();
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
          
          // Create polyline for the route
          routeLayerRef.current = L.polyline(coordinates, {
            color: '#3B82F6',
            weight: 6,
            opacity: 0.8,
            smoothFactor: 1
          }).addTo(mapInstanceRef.current!);

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

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapView;