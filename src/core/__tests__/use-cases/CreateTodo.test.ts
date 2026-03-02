import { Todo } from '../../domain/entities/Todo';
import { ValidationError } from '../../domain/errors/ValidationError';
import { CreateTodo } from '../../application/use-cases/CreateTodo';
import { InMemoryTodoRepository } from '../../infrastructure/repositories/InMemoryTodoRepository';
import { TodoBuilder } from '../builders/TodoBuilder';

describe('Todo Entity', () => {
  it('should create a todo with valid title, pending status, an ID, and a createdAt timestamp', () => {
    const todo = new TodoBuilder().withTitle('Buy milk').build();

    expect(todo.title).toBe('Buy milk');
    expect(todo.status).toBe('pending');
    expect(todo.id).toBeDefined();
    expect(typeof todo.id).toBe('string');
    expect(todo.id.length).toBeGreaterThan(0);
    expect(todo.createdAt).toBeInstanceOf(Date);
  });

  it('should reject a todo with an empty title', () => {
    expect(() => Todo.create('')).toThrow(ValidationError);
    expect(() => Todo.create('')).toThrow('Title cannot be empty');
  });

  it('should reject a todo with a whitespace-only title', () => {
    expect(() => Todo.create('   ')).toThrow(ValidationError);
    expect(() => Todo.create('   ')).toThrow('Title cannot be empty');
  });

  it('should reject a todo with a title longer than 255 characters', () => {
    const longTitle = 'a'.repeat(256);

    expect(() => Todo.create(longTitle)).toThrow(ValidationError);
    expect(() => Todo.create(longTitle)).toThrow('Title cannot exceed 255 characters');
  });

  it('should accept a todo with a title of exactly 255 characters', () => {
    const title = 'a'.repeat(255);
    const todo = Todo.create(title);

    expect(todo.title).toBe(title);
    expect(todo.title.length).toBe(255);
  });

  it('should trim leading and trailing whitespace from the title', () => {
    const todo = Todo.create('  Buy milk  ');

    expect(todo.title).toBe('Buy milk');
  });

  it('should assign unique IDs to different todos', () => {
    const todo1 = Todo.create('First todo');
    const todo2 = Todo.create('Second todo');

    expect(todo1.id).not.toBe(todo2.id);
  });
});

describe('CreateTodo Use Case', () => {
  let repository: InMemoryTodoRepository;
  let createTodo: CreateTodo;

  beforeEach(() => {
    repository = new InMemoryTodoRepository();
    createTodo = new CreateTodo(repository);
  });

  it('should create a todo and persist it via the repository', async () => {
    const todo = await createTodo.execute({ title: 'Write tests' });

    expect(todo.title).toBe('Write tests');
    expect(todo.status).toBe('pending');
    expect(todo.id).toBeDefined();

    const persisted = await repository.findById(todo.id);
    expect(persisted).toBeDefined();
    expect(persisted!.id).toBe(todo.id);
    expect(persisted!.title).toBe('Write tests');
  });

  it('should throw ValidationError when title is empty', async () => {
    await expect(createTodo.execute({ title: '' })).rejects.toThrow(ValidationError);
    await expect(createTodo.execute({ title: '' })).rejects.toThrow('Title cannot be empty');
  });

  it('should assign unique IDs to different todos', async () => {
    const todo1 = await createTodo.execute({ title: 'First' });
    const todo2 = await createTodo.execute({ title: 'Second' });

    expect(todo1.id).not.toBe(todo2.id);
  });
});
