import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
import CreateRoom from './CreaterRoom';

function MapPage({ userId, fetchLocations }) {
  const mapRef = useRef();
  const center = { lat: 40.416775, lng: -3.703790 };
  const zoom = 14;
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
      });

      locations.forEach(location => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
        });

        marker.addListener('click', () => {
          <CreateRoom userId={userId} locations={[location]} />
        });
      });
    });
  }, [userId, locations]);

  useEffect(() => {
    fetchLocations().then(setLocations);
  }, [fetchLocations]);

  return (
    <div>
      <div id="map" ref={mapRef} style={{ height: '100vh', width: '100%' }} />
      <CreateRoom userId={userId} locations={locations} />
    </div>
  );
}

export default MapPage;