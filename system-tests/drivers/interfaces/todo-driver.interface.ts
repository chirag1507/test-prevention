/**
 * TodoDriver Interface -- Protocol Driver contract for Todo operations.
 *
 * This is the interface that defines how the DSL (Layer 2) communicates
 * with the system under test through a Protocol Driver (Layer 3).
 *
 * The driver translates domain-level operations into protocol-specific
 * actions (HTTP calls, database queries, etc.). The DSL never knows
 * which protocol is being used.
 */

export interface CreateTodoDriverResult {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface RejectionResult {
  rejected: true;
  reason: string;
}

export interface TodoDriver {
  /**
   * Create a todo via the production POST /todos endpoint.
   * Returns the created todo details on success.
   * Throws if the request fails unexpectedly (non-validation errors).
   */
  createTodo(title: string): Promise<CreateTodoDriverResult>;

  /**
   * Attempt to create a todo with the given title, expecting a validation rejection.
   * Returns the rejection reason from the server.
   */
  createTodoExpectingRejection(title: string): Promise<string>;

  /**
   * Attempt to create a todo with no title field in the request body at all.
   * Returns the rejection reason from the server.
   */
  createTodoWithNoTitle(): Promise<string>;

  /**
   * Retrieve a todo by its title to verify it exists in the system.
   * Returns the todo details if found, or undefined if not found.
   *
   * For this simple app, verification is done by tracking responses
   * from creation calls, since the POST response reflects stored state.
   */
  getTodoByTitle(title: string): Promise<CreateTodoDriverResult | undefined>;

  /**
   * Retrieve the most recently created todo.
   * Returns the todo details, or undefined if no todos have been created.
   */
  getLastCreatedTodo(): Promise<CreateTodoDriverResult | undefined>;

  /**
   * Clean up all test state so the next test starts fresh.
   * This resets the application and any tracked state.
   */
  cleanup(): Promise<void>;

  /**
   * Disconnect from external resources (database connections, etc.).
   * Called once after all tests in a suite are complete.
   */
  disconnect(): Promise<void>;
}
