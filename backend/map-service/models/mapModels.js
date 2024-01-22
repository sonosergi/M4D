import { MapDatabase } from '../databases/mapDatabase.js';

export class MapModel {
    static async createMarker(user_id, lat, lng) {
        const query = `
            INSERT INTO location (user_id, lat, lng)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;
        return await MapDatabase.query(query, [user_id, lat, lng]);
    }

    static async listMarkers() {
        const query = 'SELECT * FROM location;';
        return await MapDatabase.query(query);
    }

    static async deleteMarker(id) {
        const query = 'DELETE FROM location WHERE id = $1;';
        return await MapDatabase.query(query, [id]);
    }
}