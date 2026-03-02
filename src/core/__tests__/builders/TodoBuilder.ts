import { Todo } from '../../domain/entities/Todo';

export class TodoBuilder {
  private title = 'Buy groceries';

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  build(): Todo {
    return Todo.create(this.title);
  }
}
