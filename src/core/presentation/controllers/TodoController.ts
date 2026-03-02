import { Request, Response } from 'express';
import { CreateTodo } from '../../application/use-cases/CreateTodo';
import { TodoRepository } from '../../domain/interfaces/repositories/TodoRepository';
import { ValidationError } from '../../domain/errors/ValidationError';

export class TodoController {
  constructor(
    private readonly createTodo: CreateTodo,
    private readonly repository: TodoRepository,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const title = req.body.title;

      if (title === undefined || title === null) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      if (typeof title !== 'string') {
        res.status(400).json({ error: 'Title must be a string' });
        return;
      }

      const todo = await this.createTodo.execute({ title });

      res.status(201).json({
        id: todo.id,
        title: todo.title,
        status: todo.status,
        createdAt: todo.createdAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    const todo = await this.repository.findById(req.params.id as string);

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.status(200).json({
      id: todo.id,
      title: todo.title,
      status: todo.status,
      createdAt: todo.createdAt.toISOString(),
    });
  }
}
