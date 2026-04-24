import { useMemo } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';

interface MapPoint {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface HotelLocationMapProps {
  hotel: MapPoint;
  nearbyPlaces: MapPoint[];
}

const hotelPin = new L.DivIcon({
  className: 'hotel-map-pin-shell',
  html: `
    <div class="hotel-map-pin">
      <div class="hotel-map-pin__dot"></div>
    </div>
  `,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -34],
});

const nearbyPin = new L.DivIcon({
  className: 'hotel-map-nearby-shell',
  html: `
    <div class="hotel-map-nearby">
      <div class="hotel-map-nearby__dot"></div>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

export function HotelLocationMap({ hotel, nearbyPlaces }: HotelLocationMapProps) {
  const bounds = useMemo(
    () =>
      L.latLngBounds([
        [hotel.latitude, hotel.longitude],
        ...nearbyPlaces.map((place) => [place.latitude, place.longitude] as [number, number]),
      ]).pad(0.18),
    [hotel.latitude, hotel.longitude, nearbyPlaces]
  );

  return (
    <MapContainer
      bounds={bounds}
      scrollWheelZoom
      className="hotel-location-map h-full w-full"
      attributionControl={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Circle
        center={[hotel.latitude, hotel.longitude]}
        radius={260}
        pathOptions={{
          color: '#c19e58',
          weight: 2,
          fillColor: '#c19e58',
          fillOpacity: 0.12,
        }}
      />

      <Circle
        center={[hotel.latitude, hotel.longitude]}
        radius={95}
        pathOptions={{
          color: '#ffffff',
          weight: 1,
          fillColor: '#c19e58',
          fillOpacity: 0.28,
        }}
      />

      <Marker position={[hotel.latitude, hotel.longitude]} icon={hotelPin}>
        <Tooltip direction="top" offset={[0, -28]} permanent opacity={1} className="hotel-map-tooltip-shell">
          <div className="hotel-map-tooltip">
            <span className="hotel-map-tooltip__eyebrow">H Hotel</span>
            <span className="hotel-map-tooltip__address">Kuching Waterfront</span>
          </div>
        </Tooltip>
        <Popup>
          <div>
            <strong>{hotel.name}</strong>
            <div>{hotel.description}</div>
          </div>
        </Popup>
      </Marker>

      {nearbyPlaces.map((place) => (
        <Marker key={place.name} position={[place.latitude, place.longitude]} icon={nearbyPin}>
          <Popup>
            <div>
              <strong>{place.name}</strong>
              {place.description ? <div>{place.description}</div> : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
