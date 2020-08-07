import { Router } from 'express';
import { ClassesController, ConnectionsController } from './controllers';

const routes = Router();

routes.post('/classes', ClassesController.store);
routes.get('/classes', ClassesController.index);
routes.post('/connections', ConnectionsController.store);
routes.get('/connections', ConnectionsController.index);

export default routes;
