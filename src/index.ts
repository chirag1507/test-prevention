import express, { Express } from 'express';
import { TodoRepository } from './core/domain/interfaces/repositories/TodoRepository';
import { CreateTodo } from './core/application/use-cases/CreateTodo';
import { TodoController } from './core/presentation/controllers/TodoController';
import { todoRoutes } from './core/presentation/routes/todoRoutes';

export function createApp(repository: TodoRepository): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const createTodo = new CreateTodo(repository);
  const todoController = new TodoController(createTodo, repository);

  app.use(todoRoutes(todoController));

  return app;
}

async function startServer() {
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaTodoRepository } = await import('./core/infrastructure/repositories/PrismaTodoRepository');

  const prisma = new PrismaClient();
  const repository = new PrismaTodoRepository(prisma);
  const app = createApp(repository);
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
