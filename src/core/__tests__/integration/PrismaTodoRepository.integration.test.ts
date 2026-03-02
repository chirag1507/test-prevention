import { PrismaClient } from '@prisma/client';
import { PrismaTodoRepository } from '../../infrastructure/repositories/PrismaTodoRepository';
import { Todo } from '../../domain/entities/Todo';

describe('PrismaTodoRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaTodoRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  beforeEach(async () => {
    repository = new PrismaTodoRepository(prisma);
    await prisma.todo.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should save a todo and retrieve it by ID', async () => {
    const todo = Todo.create('Buy groceries');

    await repository.save(todo);

    const found = await repository.findById(todo.id);

    expect(found).toBeDefined();
    expect(found!.id).toBe(todo.id);
    expect(found!.title).toBe('Buy groceries');
    expect(found!.status).toBe('pending');
    expect(found!.createdAt).toBeInstanceOf(Date);
  });

  it('should return undefined when todo does not exist', async () => {
    const found = await repository.findById('00000000-0000-0000-0000-000000000000');

    expect(found).toBeUndefined();
  });
});
