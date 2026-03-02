import { Todo } from '../../domain/entities/Todo';
import { TodoRepository } from '../../domain/interfaces/repositories/TodoRepository';

export class InMemoryTodoRepository implements TodoRepository {
  private todos = new Map<string, Todo>();

  async save(todo: Todo): Promise<Todo> {
    this.todos.set(todo.id, todo);
    return todo;
  }

  async findById(id: string): Promise<Todo | undefined> {
    return this.todos.get(id);
  }
}
