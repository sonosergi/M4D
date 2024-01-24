import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import CreateRoom from './CreaterRoom';
import axios from 'axios';

axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const API_MARKERS = 'http://localhost:5500/markers';
const API_CHAT_ROOMS = 'http://localhost:7000/chat_rooms';

const MapPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [showLocations, setShowLocations] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [markers, setMarkers] = useState([]);

  const mapRef = useRef(null);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await axios.get(API_MARKERS);
      setLocations(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);
  
  const toggleLocations = useCallback(() => {
    if (showLocations) {
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      setLocations([]);
    }
    setShowLocations(!showLocations);
  }, [showLocations, markers]);
  
  useEffect(() => {
    if (showLocations) {
      fetchLocations();
    }
  }, [showLocations, fetchLocations]);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await axios.get(API_CHAT_ROOMS);
      const roomsWithLocations = await Promise.all(response.data.map(async room => {
        const locationResponse = await axios.get(`${API_MARKERS}/${room.location_id}`);
        return { ...room, location: locationResponse.data };
      }));
      setRooms(roomsWithLocations);
    } catch (error) {
      console.error(error);
    }
  }, []);
  
  const toggleRooms = useCallback(() => {
    if (showRooms) {
      setRooms([]);
    }
    setShowRooms(!showRooms);
  }, [showRooms]);
  
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
  
      const newMarkers = locations.map(location => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
        });
  
        marker.addListener("click", () => {
          setSelectedLocation(location);
          setShowModal(true);
        });
  
        return marker;
      });
  
      const roomMarkers = rooms.map(room => {
        const marker = new google.maps.Marker({
          position: { lat: room.location.lat, lng: room.location.lng },
          map,
        });
  
        marker.addListener("click", () => {
          setSelectedLocation(room.location);
          setShowModal(true);
        });
  
        return marker;
      });
  
      setMarkers([...newMarkers, ...roomMarkers]);
    });
  }, [locations, rooms]);

  return (
    <>
      <div>
        <button onClick={toggleLocations}>Search</button>
        <button onClick={toggleRooms}>All Rooms</button>
        <div ref={mapRef} style={{ width: '100%', height: '670px', alignContent: 'center' }}></div>
      </div>
      {showModal && <CreateRoom locationId={selectedLocation.id} closeModal={() => setShowModal(false)} roomName={roomName} setRoomName={setRoomName} />}
      {showLocations && locations.map(location => <div key={location.id}>{location.name}</div>)}
      {showRooms && rooms.map(room => <div key={room.id}>{room.name}</div>)}
    </>
  );
};

export default MapPage;