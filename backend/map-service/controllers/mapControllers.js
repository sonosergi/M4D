import axios from 'axios';
import { Marker } from '../models/mapModels.js';

const CHAT_SERVICE_URL = 'http://localhost:7000';

export const mapController = {
  async createMarker(req, res) {
    const { lat, lng, roomName, userId } = req.body;

    // Crea una nueva sala de chat para este marcador
    const chatRoomResponse = await axios.post(`${CHAT_SERVICE_URL}/chat_rooms`, { roomName, locationId: userId });
    const chatRoomId = chatRoomResponse.data.id;

    // Almacena el marcador en la base de datos
    const marker = await Marker.create(userId, lat, lng, chatRoomId);

    res.status(201).json(marker);
  },

  async listMarkers(req, res) {
    const markers = await Marker.findAll();
    res.json(markers);
  },

  async deleteMarker(req, res) {
    const { id } = req.params;

    // Elimina la sala de chat asociada con este marcador
    await axios.delete(`${CHAT_SERVICE_URL}/chat_rooms/${id}`);

    // Elimina el marcador de la base de datos
    await Marker.delete(id);

    res.json({ message: 'Marker deleted' });
  },
};