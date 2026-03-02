import request from 'supertest';
import { createApp } from '../../../index';
import { InMemoryTodoRepository } from '../../infrastructure/repositories/InMemoryTodoRepository';

describe('Todo API', () => {
  const app = createApp(new InMemoryTodoRepository());

  it('should return 201 and the created todo with a valid title', async () => {
    const response = await request(app)
      .post('/todos')
      .send({ title: 'Buy groceries' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Buy groceries');
    expect(response.body.status).toBe('pending');
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  it('should return 400 with error message when title is empty', async () => {
    const response = await request(app)
      .post('/todos')
      .send({ title: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 with error message when title is missing', async () => {
    const response = await request(app)
      .post('/todos')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 with error message when title is not a string', async () => {
    const response = await request(app)
      .post('/todos')
      .send({ title: 123 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 with error message when title exceeds 255 characters', async () => {
    const longTitle = 'a'.repeat(256);

    const response = await request(app)
      .post('/todos')
      .send({ title: longTitle });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('GET /todos/:id should return 200 and the todo when it exists', async () => {
    const createResponse = await request(app)
      .post('/todos')
      .send({ title: 'Fetch me later' });

    const id = createResponse.body.id;

    const getResponse = await request(app)
      .get(`/todos/${id}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(id);
    expect(getResponse.body.title).toBe('Fetch me later');
    expect(getResponse.body.status).toBe('pending');
    expect(getResponse.body.createdAt).toBeDefined();
  });

  it('GET /todos/:id should return 404 when todo does not exist', async () => {
    const response = await request(app)
      .get('/todos/00000000-0000-0000-0000-000000000000');

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });
});
