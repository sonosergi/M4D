import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

const API_GETMARKERS = 'http://localhost:10000/posts';
const API_CHAT_ROOMS = 'http://localhost:7000/chat_rooms';

const MapPage = ({ showLocations, showRooms, setShowModal, setSelectedLocation, isMarkerMode }) => {
  const [locations, setLocations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [markers, setMarkers] = useState([]); 
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await axios.get(API_GETMARKERS);
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
    if (!mapRef.current) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["drawing"],
    });
    
    loader.load().then(() => {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 40.416775, lng: -3.70379 },
        zoom: 18.5,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        tilt: 70, 
      });
    
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '180';
      slider.value = '90';
      slider.id = 'heading-slider';
    
      const sliderContainer = document.createElement('div');
      sliderContainer.appendChild(slider);
    
      map.controls[google.maps.ControlPosition.TOP_CENTER].push(sliderContainer);
    
      slider.addEventListener('input', function() {
        map.setHeading(parseInt(this.value));
      });
    
      if (showLocations) {
        locations.forEach(location => {
          const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map,
          });
      
          setMarkers(prevMarkers => [...prevMarkers, marker]); 
      
          marker.addListener("click", () => {
            setSelectedLocation(location);
            setShowModal(true);
            navigate(`/main/post/${location.id}`, { state: { lat: location.lat, lng: location.lng } }); // Pasar lat y lng como state
          });
        });
      }
    
      if (showRooms) {
        rooms.forEach(room => {
          const marker = new google.maps.Marker({
            position: { lat: room.lat, lng: room.lng },
            map,
          });
        
          setMarkers(prevMarkers => [...prevMarkers, marker]); 
        
          marker.addListener("click", () => {
            setSelectedLocation({ lat: room.lat, lng: room.lng });
            navigate(`/main/chat/${room.id}`);
          });
        });
      }
    
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.MARKER,
          ],
        },
    
        markerOptions: {
          icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
        },
    
        circleOptions: {
          fillColor: "#ffff00",
          fillOpacity: 1,
          strokeWeight: 5,
          clickable: false,
          editable: true,
          zIndex: 1,
        },
      });
    
      drawingManagerRef.current = drawingManager;
    
      drawingManager.setMap(map);
    
      google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
        if (event.type == 'marker') {
          const lat = event.overlay.position.lat();
          const lng = event.overlay.position.lng();
          setSelectedLocation({ lat, lng });
          setShowModal(true);
        }
      });
    
      if (isMarkerMode) { // Activar el DrawingManager si isMarkerMode es true
        drawingManager.setMap(map);
      } else { // Desactivar el DrawingManager si isMarkerMode es false
        drawingManager.setMap(null);
      }
    
    });
  }, [locations, rooms, navigate, showLocations, showRooms, isMarkerMode]);

  useEffect(() => {
    markers.forEach(marker => {
      if (marker instanceof google.maps.Marker) {
        marker.setMap(null);
      }
    });
    setMarkers([]);
  }, [showLocations, showRooms]);
  
  useEffect(() => {
    if (drawingManagerRef.current && drawingManagerRef.current instanceof google.maps.drawing.DrawingManager) {
      if (mapRef.current instanceof google.maps.Map) {
        if (isMarkerMode) {
          drawingManagerRef.current.setMap(mapRef.current);
        } else {
          drawingManagerRef.current.setMap(null);
        }
      }
    }
  }, [isMarkerMode]);

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