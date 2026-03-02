/**
 * TodoDSL -- Domain-Specific Language for Todo acceptance tests.
 *
 * This is Layer 2 (DSL) in Dave Farley's Four-Layer Model.
 * It expresses user interactions in problem-domain language.
 * No HTTP details, no JSON, no implementation specifics leak into this interface.
 *
 * The DSL delegates all system interactions to a Protocol Driver (Layer 3),
 * translating domain concepts into driver calls and driver results back
 * into domain assertions.
 */

import { TodoDriver } from '../drivers/interfaces/todo-driver.interface';
import { TodoApiDriver } from '../drivers/api/todo-api.driver';

export interface CreateTodoResult {
  title: string;
  status: string;
  hasId: boolean;
  hasTimestamp: boolean;
}

export interface TodoDSL {
  /**
   * Create a new todo item with the given title.
   * Throws a domain-level rejection if validation fails.
   */
  createTodo(title: string): Promise<CreateTodoResult>;

  /**
   * Attempt to create a todo and expect it to be rejected.
   * Returns the rejection reason as a domain-level string.
   */
  attemptCreateTodoExpectingRejection(title: string): Promise<string>;

  /**
   * Attempt to create a todo with no title provided at all
   * (the field is completely absent, not just empty).
   * Returns the rejection reason as a domain-level string.
   */
  attemptCreateTodoWithNoTitle(): Promise<string>;

  /**
   * Assert that a todo with the given title exists in the system
   * and has the expected status.
   */
  assertTodoExists(title: string, expectedStatus: string): Promise<void>;

  /**
   * Retrieve the title of the most recently created todo,
   * so we can verify trimming behavior.
   */
  getLastCreatedTodoTitle(): Promise<string>;

  /**
   * Clean up all test state so the next test starts fresh.
   */
  cleanup(): Promise<void>;

  /**
   * Disconnect from external resources after all tests complete.
   */
  disconnect(): Promise<void>;
}

export async function createTodoDSL(): Promise<TodoDSL> {
  const driver: TodoDriver = new TodoApiDriver();

  return {
    async createTodo(title: string): Promise<CreateTodoResult> {
      const result = await driver.createTodo(title);

      return {
        title: result.title,
        status: result.status,
        hasId: typeof result.id === 'string' && result.id.length > 0,
        hasTimestamp:
          typeof result.createdAt === 'string' && result.createdAt.length > 0,
      };
    },

    async attemptCreateTodoExpectingRejection(title: string): Promise<string> {
      return driver.createTodoExpectingRejection(title);
    },

    async attemptCreateTodoWithNoTitle(): Promise<string> {
      return driver.createTodoWithNoTitle();
    },

    async assertTodoExists(
      title: string,
      expectedStatus: string
    ): Promise<void> {
      const todo = await driver.getTodoByTitle(title);

      if (!todo) {
        throw new Error(
          `Expected todo with title "${title}" to exist, but it was not found`
        );
      }

      if (todo.status !== expectedStatus) {
        throw new Error(
          `Expected todo "${title}" to have status "${expectedStatus}", but it had status "${todo.status}"`
        );
      }
    },

    async getLastCreatedTodoTitle(): Promise<string> {
      const todo = await driver.getLastCreatedTodo();

      if (!todo) {
        throw new Error('No todos have been created yet');
      }

      return todo.title;
    },

    async cleanup(): Promise<void> {
      await driver.cleanup();
    },

    async disconnect(): Promise<void> {
      await driver.disconnect();
    },
  };
}
