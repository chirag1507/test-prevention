/**
 * Executable Specification: Create Todo
 *
 * Layer 1 of Dave Farley's Four-Layer Model.
 * These tests describe the behavior of the system in problem-domain language.
 * There are no HTTP verbs, status codes, JSON payloads, or implementation
 * details anywhere in this file. The DSL (Layer 2) translates these
 * intentions into real system interactions.
 *
 * Business Rules Under Test:
 *   R1 - A todo must have a non-empty title
 *   R2 - A todo title must not exceed 255 characters
 *   R3 - A newly created todo always starts with status "pending"
 *   R4 - Each todo receives a unique identifier upon creation
 *   R5 - Each todo records its creation timestamp
 *   R6 - The title is trimmed of leading/trailing whitespace before storage
 */

import { TodoDSL, createTodoDSL } from "../../dsl/todo.dsl";

describe("Create Todo", () => {
  let todoApp: TodoDSL;

  beforeAll(async () => {
    todoApp = await createTodoDSL();
  });

  afterEach(async () => {
    await todoApp.cleanup();
  });

  afterAll(async () => {
    await todoApp.disconnect();
  });

  // ---------------------------------------------------------------------------
  // Happy Path
  // ---------------------------------------------------------------------------

  it("should create a new todo item with pending status", async () => {
    const result = await todoApp.createTodo("Buy groceries");

    expect(result.title).toBe("Buy groceries");
    expect(result.status).toBe("pending");
    expect(result.hasId).toBe(true);
    expect(result.hasTimestamp).toBe(true);

    await todoApp.assertTodoExists("Buy groceries", "pending");
  });

  it("should assign a unique identifier to each todo", async () => {
    const first = await todoApp.createTodo("Buy groceries");
    const second = await todoApp.createTodo("Walk the dog");

    expect(first.hasId).toBe(true);
    expect(second.hasId).toBe(true);

    // Both todos exist independently in the system
    await todoApp.assertTodoExists("Buy groceries", "pending");
    await todoApp.assertTodoExists("Walk the dog", "pending");
  });

  it("should accept a title at the maximum allowed length", async () => {
    const maxLengthTitle = "a".repeat(255);

    const result = await todoApp.createTodo(maxLengthTitle);

    expect(result.title).toBe(maxLengthTitle);
    expect(result.status).toBe("pending");
  });

  // ---------------------------------------------------------------------------
  // Validation: empty and missing titles (Rule R1)
  // ---------------------------------------------------------------------------

  it("should reject a todo with an empty title", async () => {
    const reason = await todoApp.attemptCreateTodoExpectingRejection("");

    expect(reason).toContain("title");
  });

  it("should reject a todo with a whitespace-only title", async () => {
    const reason = await todoApp.attemptCreateTodoExpectingRejection("   ");

    expect(reason).toContain("title");
  });

  it("should reject a todo when no title is provided at all", async () => {
    const reason = await todoApp.attemptCreateTodoWithNoTitle();

    expect(reason).toContain("title");
  });

  // ---------------------------------------------------------------------------
  // Validation: title length (Rule R2)
  // ---------------------------------------------------------------------------

  it("should reject a todo with a title exceeding the maximum allowed length", async () => {
    const tooLongTitle = "a".repeat(256);

    const reason = await todoApp.attemptCreateTodoExpectingRejection(tooLongTitle);

    expect(reason).toContain("title");
  });

  // ---------------------------------------------------------------------------
  // Whitespace trimming (Rule R6)
  // ---------------------------------------------------------------------------

  it("should trim leading and trailing whitespace from the title", async () => {
    await todoApp.createTodo("  Buy groceries  ");

    const storedTitle = await todoApp.getLastCreatedTodoTitle();

    expect(storedTitle).toBe("Buy groceries");
  });
});
