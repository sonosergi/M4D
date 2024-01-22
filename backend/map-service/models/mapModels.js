import dbmap from './database/mapDatabase.js';

export const Marker = {
  create: (lat, lng, chatRoomId) => dbmap.one('INSERT INTO location(lat, lng, chat_room_id) VALUES($1, $2, $3) RETURNING *', [lat, lng, chatRoomId]),
  findAll: () => dbmap.any('SELECT * FROM location'),
  delete: (id) => dbmap.none('DELETE FROM location WHERE id = $1', [id]),
};