import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../errors/ValidationError';

export class Todo {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly createdAt: Date;

  private constructor(id: string, title: string, status: string, createdAt: Date) {
    this.id = id;
    this.title = title;
    this.status = status;
    this.createdAt = createdAt;
  }

  static reconstitute(props: { id: string; title: string; status: string; createdAt: Date }): Todo {
    return new Todo(props.id, props.title, props.status, props.createdAt);
  }

  static create(title: string): Todo {
    const trimmed = title.trim();

    if (trimmed.length === 0) {
      throw new ValidationError('Title cannot be empty');
    }

    if (trimmed.length > 255) {
      throw new ValidationError('Title cannot exceed 255 characters');
    }

    return new Todo(uuidv4(), trimmed, 'pending', new Date());
  }
}
