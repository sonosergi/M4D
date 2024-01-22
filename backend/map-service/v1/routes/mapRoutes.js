import { Router } from 'express';
import { mapController } from '../controllers/mapControllers.js';

const mapRouter = Router();

mapRouter.post('/markers', mapController.createMarker);
mapRouter.get('/markers', mapController.listMarkers);
mapRouter.delete('/markers/:id', mapController.deleteMarker);

export default mapRouter;