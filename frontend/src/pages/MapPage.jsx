import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

const API_MARKERS = 'http://localhost:5500/markers';
const API_CHAT_ROOMS = 'http://localhost:7000/chat_rooms';

const MapPage = ({ showLocations, showRooms, setShowModal, setSelectedLocation }) => {
  const [locations, setLocations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [markers, setMarkers] = useState([]); // New state for markers
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await axios.get(API_MARKERS);
      setLocations(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);
  
  useEffect(() => {
    if (showLocations) {
      fetchLocations();
    }
  }, [showLocations, fetchLocations]);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await axios.get(API_CHAT_ROOMS);
      setRooms(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);
  
  useEffect(() => {
    if (showRooms) {
      fetchRooms();
    }
  }, [showRooms, fetchRooms]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });
  
    loader.load().then(() => {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 40.416775, lng: -3.70379 },
        zoom: 10,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
      });
  
      if (showLocations) {
        locations.forEach(location => {
          const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map,
          });
  
          setMarkers(prevMarkers => [...prevMarkers, marker]); // Add marker to state
  
          marker.addListener("click", () => {
            setSelectedLocation(location);
            setShowModal(true);
          });
        });
      }
  
      if (showRooms) {
        rooms.forEach(room => {
          const marker = new google.maps.Marker({
            position: { lat: room.lat, lng: room.lng },
            map,
          });
        
          setMarkers(prevMarkers => [...prevMarkers, marker]); // Add marker to state
        
          marker.addListener("click", () => {
            setSelectedLocation({ lat: room.lat, lng: room.lng });
            navigate(`/main/chat/${room.id}`);
          });
        });
      }
    });
  }, [locations, rooms, navigate, showLocations, showRooms]);

  // New effect to remove markers when showLocations or showRooms changes
  useEffect(() => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  }, [showLocations, showRooms]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <div ref={mapRef} style={{ width: '100vw', height: '100vh', alignContent: 'center' }}></div>
        {showLocations && locations.map(location => <div key={location.id}>{location.name}</div>)}
        {showRooms && rooms.map(room => <div key={room.id}>{room.name}</div>)}
      </div>
    </div>
  );
};

export default MapPage;