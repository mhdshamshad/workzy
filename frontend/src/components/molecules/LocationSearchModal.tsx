import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

import { MAPBOX_TOKEN } from '@/constants';
import { handleApiError } from '@/utils/handleApiError';

import { AppModal } from './AppModal';
import SearchInput from './SearchInput';

const INDIA_BBOX = '68.1766,6.7479,97.4025,35.5087';

interface LocationResult {
  id: string;
  place_name: string;
  text: string;
  place_type: string[];
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
}

export interface SelectedLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectLocation: (location: SelectedLocation) => void;
  title?: string;
  description?: string;
}

export function LocationSearchModal({
  open,
  onClose,
  onSelectLocation,
  title = 'Search Location',
  description = 'Search and select a location',
}: LocationSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const fetchLocations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchQuery
          )}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,district,region&limit=5&country=IN&bbox=${INDIA_BBOX}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const data = await response.json();
        if (!cancelled) {
          setResults(data.features || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to search locations. Please try again.');
          console.error(handleApiError(err));
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const handleUseCurrentLocation = async () => {
    setUseCurrentLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setUseCurrentLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,district,region&country=IN&bbox=${INDIA_BBOX}`
          );

          if (!response.ok) {
            throw new Error('Failed to reverse geocode');
          }

          const data = await response.json();
          if (data.features && data.features.length > 0) {
            setResults(data.features);
          }
        } catch (err) {
          setError('Failed to get your current location');
          console.error(handleApiError(err));
        } finally {
          setUseCurrentLocation(false);
        }
      },
      () => {
        setError('Unable to retrieve your location');
        setUseCurrentLocation(false);
      }
    );
  };

  const handleSelectLocation = (location: LocationResult) => {
    const [longitude, latitude] = location.center;
    onSelectLocation({
      name: location.text,
      address: location.place_name,
      latitude,
      longitude,
    });
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
    onClose();
  };

  const getLocationSubtext = (location: LocationResult) => {
    const contextText = location.context
      ?.filter(ctx => ctx.id.includes('region') || ctx.id.includes('country'))
      .map(ctx => ctx.text)
      .join(', ');
    return contextText || location.place_name;
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      isTitleHidden={false}
      isDescriptionHidden={true}
      className="sm:max-w-md"
      footer={null}
    >
      <div className="w-full space-y-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search for a city or location..."
          className="w-full"
        />

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={useCurrentLocation}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          <MapPin className="w-4 h-4 shrink-0" />
          {useCurrentLocation && (
            <div className="w-4 h-4 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
              </div>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-0.5 bg-primary/30 relative overflow-hidden">
                  <div className="absolute inset-0 w-1/3 bg-primary animate-[slide_1s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          )}
          <span>Use current location</span>
        </button>

        <style>{`
          @keyframes slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-3">Suggestions</p>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <MapPin className="w-6 h-6 text-muted-foreground" />
                <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-muted relative overflow-hidden rounded-full">
                    <div className="absolute inset-0 w-1/2 bg-primary animate-[slide_0.8s_ease-in-out_infinite] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          {!isLoading && results.length > 0 && (
            <div className="max-h-80 overflow-y-auto border border-border rounded-lg">
              {results.map(location => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleSelectLocation(location)}
                  className="w-full flex items-start gap-3 p-3 hover:bg-accent transition-colors border-b border-border last:border-b-0 text-left"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{location.text}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {getLocationSubtext(location)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && searchQuery && results.length === 0 && !error && (
            <div className="text-center py-8 text-muted-foreground">
              No locations found. Try a different search term.
            </div>
          )}

          {/* Initial State */}
          {!isLoading && !searchQuery && results.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Search for a city or use your current location
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}
