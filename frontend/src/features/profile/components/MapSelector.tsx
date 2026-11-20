import { useEffect, useRef, useState } from 'react';

import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '@/constants';
import type { Address } from '@/types/user';

import type { Map as MapboxMap } from 'mapbox-gl';

type MapboxContextItem = {
  id: string;
  text: string;
};

const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [68.1, 6.5], // Southwest
  [97.5, 37.2], // Northeast
];

interface MapSelectorProps {
  onLocationSelect: (coordinates: [number, number], address?: Address) => void;
  onClose: () => void;
}

export default function MapSelector({ onLocationSelect, onClose }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapboxMap | null>(null);
  const [mapLoadError, setMapLoadError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: MapboxMap | null = null;

    const initializeMap = async (center: [number, number]) => {
      try {
        const { default: mapbox } = await import('mapbox-gl');
        if (disposed || !mapRef.current || mapInstanceRef.current) {
          return;
        }

        mapbox.accessToken = MAPBOX_TOKEN || '';

        map = new mapbox.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center,
          zoom: 5,
          minZoom: 4,
          maxZoom: 18,
          maxBounds: INDIA_BOUNDS,
          renderWorldCopies: false,
        });

        mapInstanceRef.current = map;
        const geolocate = new mapbox.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        });

        map.addControl(geolocate);

        map.on('click', async e => {
          const { lng, lat } = e.lngLat;

          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,place,region,postcode`
            );
            const data = await response.json();

            const addressComponents: Address = {};
            if (data.features && data.features.length > 0) {
              const feature = data.features[0];
              const context: MapboxContextItem[] = feature.context || [];

              context.forEach(item => {
                if (item.id.includes('postcode')) {
                  addressComponents.pincode = item.text;
                }

                if (item.id.includes('region')) {
                  addressComponents.state = item.text;
                }

                if (context.length === 6) {
                  if (item.id.includes('locality')) {
                    addressComponents.place = item.text;
                  }
                  if (item.id.includes('place')) {
                    addressComponents.city = item.text;
                  }
                } else {
                  if (item.id.includes('place')) {
                    addressComponents.place = item.text;
                  }
                  if (item.id.includes('district')) {
                    addressComponents.city = item.text;
                  }
                }

                addressComponents.house =
                  feature.place_name?.split(',')[0] || addressComponents.place;
              });
            }

            onLocationSelect([lng, lat], addressComponents);
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            onLocationSelect([lng, lat]);
          }
        });
      } catch (error) {
        if (!disposed) {
          console.error('Failed to initialize the Mapbox map:', error);
          setMapLoadError(true);
        }
      }
    };

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        void initializeMap([longitude, latitude]);
      },
      () => {
        void initializeMap([78.9629, 20.5937]);
      },
      { timeout: 5000 }
    );

    return () => {
      disposed = true;
      if (map) {
        map.remove();
        if (mapInstanceRef.current === map) {
          mapInstanceRef.current = null;
        }
      }
    };
  }, [onLocationSelect]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-semibold text-sm">Click on the map to set your location</h5>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close Map
        </button>
      </div>
      <div ref={mapRef} className="w-full h-64 rounded-lg border" />
      {mapLoadError && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          The map could not be loaded. Please try again.
        </p>
      )}
    </div>
  );
}
