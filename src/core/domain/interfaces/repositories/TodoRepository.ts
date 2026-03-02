import { Todo } from '../../entities/Todo';

export interface TodoRepository {
  save(todo: Todo): Promise<Todo>;
  findById(id: string): Promise<Todo | undefined>;
}
