import { Todo } from '../../domain/entities/Todo';
import { TodoRepository } from '../../domain/interfaces/repositories/TodoRepository';

interface CreateTodoInput {
  title: string;
}

export class CreateTodo {
  constructor(private readonly repository: TodoRepository) {}

  async execute(input: CreateTodoInput): Promise<Todo> {
    const todo = Todo.create(input.title);
    await this.repository.save(todo);
    return todo;
  }
}
