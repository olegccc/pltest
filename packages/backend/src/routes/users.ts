import { Router } from 'express';
import { UsersController } from '../controllers/users.js';

export const createUsersRouter = (usersController: UsersController) => {
  const router = Router();

  router.get('/users', usersController.getUsers);
  router.get('/users/:user_id/metrics', usersController.getUserMetrics);
  router.post('/users/:user_id/explain', usersController.explainUserMetrics);

  return router;
};
