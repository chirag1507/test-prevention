import { PrismaClient } from '@prisma/client';
import { Todo } from '../../domain/entities/Todo';
import { TodoRepository } from '../../domain/interfaces/repositories/TodoRepository';

export class PrismaTodoRepository implements TodoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(todo: Todo): Promise<Todo> {
    await this.prisma.todo.create({
      data: {
        id: todo.id,
        title: todo.title,
        status: todo.status,
        createdAt: todo.createdAt,
      },
    });
    return todo;
  }

  async findById(id: string): Promise<Todo | undefined> {
    const record = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!record) {
      return undefined;
    }

    return Todo.reconstitute({
      id: record.id,
      title: record.title,
      status: record.status,
      createdAt: record.createdAt,
    });
  }
}
