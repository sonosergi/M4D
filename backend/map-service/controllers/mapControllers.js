import { MapModel } from '../models/mapModels.js';

export const mapController = {
    createMarker: async (req, res) => {
        const { user_id, lat, lng } = req.body;
        try {
            const result = await MapModel.createMarker(user_id, lat, lng);
            res.status(201).json({ id: result[0].id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    listMarkers: async (req, res) => {
        try {
            const result = await MapModel.listMarkers();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteMarker: async (req, res) => {
        const { id } = req.params;
        try {
            await MapModel.deleteMarker(id);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};