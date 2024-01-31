import { MapModel } from '../models/mapModels.js';

export const mapController = {
    createMarker: async (req, res, next) => {
        const { lat, lng } = req.body;

        // Check if the user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Extract the user_id from req.user
        const userId = req.user.id;

        try {
            const result = await MapModel.createMarker(userId, lat, lng);
            res.status(201).json({ id: result[0].id });
        } catch (error) {
            console.error(error);
            if (error.message === 'Marker already exists') {
                res.status(400).json({ message: 'Marker already exists' });
            } else {
                next(new Error('An error occurred while creating the marker'));
            }
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