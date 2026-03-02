import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../../src/index';
import { PrismaTodoRepository } from '../../../src/core/infrastructure/repositories/PrismaTodoRepository';
import {
  TodoDriver,
  CreateTodoDriverResult,
} from '../interfaces/todo-driver.interface';

export class TodoApiDriver implements TodoDriver {
  private app: Express;
  private prisma: PrismaClient;
  private createdTodos: CreateTodoDriverResult[] = [];

  constructor() {
    this.prisma = new PrismaClient();
    const repository = new PrismaTodoRepository(this.prisma);
    this.app = createApp(repository);
  }

  async createTodo(title: string): Promise<CreateTodoDriverResult> {
    const response = await request(this.app)
      .post('/todos')
      .send({ title })
      .expect(201);

    const result: CreateTodoDriverResult = {
      id: response.body.id,
      title: response.body.title,
      status: response.body.status,
      createdAt: response.body.createdAt,
    };

    this.createdTodos.push(result);
    return result;
  }

  async createTodoExpectingRejection(title: string): Promise<string> {
    const response = await request(this.app)
      .post('/todos')
      .send({ title })
      .expect(400);

    return this.normalizeErrorMessage(response.body.error);
  }

  async createTodoWithNoTitle(): Promise<string> {
    const response = await request(this.app)
      .post('/todos')
      .send({})
      .expect(400);

    return this.normalizeErrorMessage(response.body.error);
  }

  async getTodoByTitle(
    title: string
  ): Promise<CreateTodoDriverResult | undefined> {
    const id = this.createdTodos.find((todo) => todo.title === title)?.id;
    if (!id) return undefined;

    const response = await request(this.app).get(`/todos/${id}`);
    if (response.status === 404) return undefined;

    return {
      id: response.body.id,
      title: response.body.title,
      status: response.body.status,
      createdAt: response.body.createdAt,
    };
  }

  async getLastCreatedTodo(): Promise<CreateTodoDriverResult | undefined> {
    if (this.createdTodos.length === 0) {
      return undefined;
    }
    const last = this.createdTodos[this.createdTodos.length - 1];

    const response = await request(this.app).get(`/todos/${last.id}`);
    if (response.status === 404) return undefined;

    return {
      id: response.body.id,
      title: response.body.title,
      status: response.body.status,
      createdAt: response.body.createdAt,
    };
  }

  async cleanup(): Promise<void> {
    this.createdTodos = [];
    await this.prisma.todo.deleteMany();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  private normalizeErrorMessage(message: string): string {
    return message.toLowerCase();
  }
}
