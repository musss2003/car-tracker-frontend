import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from './card';
import { Label } from './label';
import { Input } from './input';
import { Button } from './button';
import { MapPin, X } from 'lucide-react';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface LocationData {
  address: string;
  notes?: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  label: string;
  placeholder?: string;
  notesPlaceholder?: string;
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
  defaultCenter?: [number, number];
}

// Component to handle map clicks
function LocationMarker({
  position,
  setPosition,
  onAddressUpdate,
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  onAddressUpdate: (address: string) => void;
}) {
  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      // Reverse geocode to get address
      reverseGeocode(e.latlng.lat, e.latlng.lng, onAddressUpdate);
    },
  });

  return position ? <Marker position={position} /> : null;
}

// Component to recenter map when position changes
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Simple reverse geocoding using Nominatim (OpenStreetMap)
async function reverseGeocode(
  lat: number,
  lng: number,
  callback: (address: string) => void
) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await response.json();
    callback(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  } catch (error) {
    console.error('Geocoding error:', error);
    callback(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  }
}

// Forward geocoding - search address to get coordinates
async function forwardGeocode(
  address: string,
  callback: (lat: number, lng: number) => void
) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length > 0) {
      callback(parseFloat(data[0].lat), parseFloat(data[0].lon));
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
}

export function LocationPicker({
  label,
  placeholder = 'Kliknite na mapu da odaberete lokaciju',
  notesPlaceholder = 'Dodatne napomene o lokaciji (opcionalno)',
  value,
  onChange,
  defaultCenter = [43.8563, 18.4131], // Sarajevo, Bosnia
}: LocationPickerProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null
  );
  const [address, setAddress] = useState(value?.address || '');
  const [notes, setNotes] = useState(value?.notes || '');
  const [searchSuggestions, setSearchSuggestions] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update parent when marker position or notes change
  const handleMarkerPositionChange = (pos: [number, number]) => {
    setMarkerPosition(pos);
  };

  const handleAddressUpdate = (newAddress: string) => {
    setAddress(newAddress);
    if (markerPosition) {
      onChange({
        address: newAddress,
        notes: notes,
        lat: markerPosition[0],
        lng: markerPosition[1],
      });
    }
  };

  // Handle address input with autocomplete
  const handleAddressInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);

    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setSearchSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const newPos: [number, number] = [lat, lng];

    setAddress(suggestion.display_name);
    setMarkerPosition(newPos);
    setMapCenter(newPos);
    setShowSuggestions(false);
    setSearchSuggestions([]);

    onChange({
      address: suggestion.display_name,
      notes: notes,
      lat,
      lng,
    });
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    if (markerPosition) {
      onChange({
        address: address,
        notes: newNotes,
        lat: markerPosition[0],
        lng: markerPosition[1],
      });
    }
  };

  // Handle manual address search
  const handleSearchAddress = () => {
    if (address.trim()) {
      forwardGeocode(address, (lat, lng) => {
        const newPos: [number, number] = [lat, lng];
        setMarkerPosition(newPos);
        setMapCenter(newPos);
        onChange({
          address,
          notes: notes,
          lat,
          lng,
        });
      });
    }
    setShowSuggestions(false);
  };

  // Clear location
  const handleClear = () => {
    setMarkerPosition(null);
    setAddress('');
    setNotes('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <Label
        htmlFor={`address-${label}`}
        className="text-base font-semibold text-gray-900"
      >
        {label}
      </Label>

      {/* Address Search Input - First */}
      <div className="space-y-2 relative">
        <Label htmlFor={`address-${label}`} className="text-sm font-medium">
          Adresa
        </Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              id={`address-${label}`}
              type="text"
              placeholder={placeholder}
              value={address}
              onChange={handleAddressInput}
              onFocus={() => {
                if (searchSuggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchAddress();
                }
              }}
              className="pr-10"
            />
            {address && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="absolute right-0 top-0 h-full"
                title="Obriši"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Autocomplete Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <Card className="absolute z-[1000] w-full mt-1 max-h-60 overflow-y-auto shadow-lg bg-white">
                <CardContent className="p-0">
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-gray-500 flex-shrink-0" />
                        <span className="text-sm">
                          {suggestion.display_name}
                        </span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSearchAddress}
            title="Pretraži"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map - Second */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Odaberite na Mapi
          <span className="text-xs text-muted-foreground ml-2 font-normal">
            (Kliknite na mapu)
          </span>
        </Label>
        <Card>
          <CardContent className="p-0">
            <div className="h-[250px] md:h-[300px] lg:h-[250px] w-full rounded-md overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                  position={markerPosition}
                  setPosition={handleMarkerPositionChange}
                  onAddressUpdate={handleAddressUpdate}
                />
                <MapRecenter center={mapCenter} />
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Location Display - Better styled */}
      {markerPosition && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">
                    Odabrana Lokacija
                  </p>
                  <p className="text-sm text-gray-800 font-medium break-words">
                    {address}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {value?.lat.toFixed(6)}, {value?.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Field - Third */}
      <div className="space-y-2">
        <Label htmlFor={`notes-${label}`} className="text-sm font-medium">
          Napomena
          <span className="text-xs text-muted-foreground ml-2 font-normal">
            (Opcionalno)
          </span>
        </Label>
        <Input
          id={`notes-${label}`}
          type="text"
          placeholder={notesPlaceholder}
          value={notes}
          onChange={handleNotesChange}
        />
      </div>
    </div>
  );
}
