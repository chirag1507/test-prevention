import { Router } from 'express';
import { TodoController } from '../controllers/TodoController';

export function todoRoutes(controller: TodoController): Router {
  const router = Router();

  router.post('/todos', (req, res) => controller.create(req, res));
  router.get('/todos/:id', (req, res) => controller.findById(req, res));

  return router;
}
