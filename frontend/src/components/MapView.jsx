import { useEffect, useRef } from 'react';

export default function MapView({ data }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!data || !mapRef.current) return;

    const { lat, lon, resolvedName, osmLink, googleMapsLink } = data;

    // Leaflet is loaded via CDN (or npm). We use the global L from window.
    // Since we have leaflet npm package + react-leaflet, use dynamic import.
    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icon path issue with Vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Destroy previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current).setView([lat, lon], 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(
          `<b>${resolvedName}</b><br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`
        )
        .openPopup();
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data]);

  if (!data) return null;

  return (
    <div className="map-section">
      <h2 className="section-title">🗺 Map — {data.resolvedName}</h2>
      <div ref={mapRef} className="leaflet-map" />
      <div className="map-links">
        <a href={data.osmLink} target="_blank" rel="noopener noreferrer" className="map-link">
          🌍 Open in OpenStreetMap
        </a>
        <a href={data.googleMapsLink} target="_blank" rel="noopener noreferrer" className="map-link">
          📍 Open in Google Maps
        </a>
      </div>
    </div>
  );
}
