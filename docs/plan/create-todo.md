# Feature Plan: Create Todo

## User Story

**As** an individual user,
**I want to** create a new todo item by providing a title,
**so that** I can capture a task I need to track.

---

## Example Mapping

### Business Rules

| # | Rule |
|---|------|
| R1 | A todo must have a non-empty title |
| R2 | A todo title must not exceed 255 characters |
| R3 | A newly created todo always starts with status "pending" |
| R4 | Each todo receives a unique ID upon creation |
| R5 | Each todo records its creation timestamp |
| R6 | The title is trimmed of leading/trailing whitespace before storage |
| R7 | The API accepts a JSON body and returns the created todo as JSON |
| R8 | The API responds with HTTP 201 on successful creation |
| R9 | The API responds with HTTP 400 when validation fails |

### Examples (Given-When-Then)

#### Rule R1 -- A todo must have a non-empty title

**Example 1.1: Happy path -- valid title**
```
Given no todos exist
When I create a todo with title "Buy groceries"
Then the todo is created successfully
And it has the title "Buy groceries"
```

**Example 1.2: Empty string title**
```
Given no todos exist
When I create a todo with title ""
Then creation fails with a validation error
And the error indicates that the title must not be empty
```

**Example 1.3: Whitespace-only title**
```
Given no todos exist
When I create a todo with title "   "
Then creation fails with a validation error
And the error indicates that the title must not be empty
```

**Example 1.4: Missing title field entirely**
```
Given no todos exist
When I send a create request with no title field in the body
Then creation fails with a validation error
And the error indicates that the title is required
```

#### Rule R2 -- A todo title must not exceed 255 characters

**Example 2.1: Title at maximum length (255 chars)**
```
Given no todos exist
When I create a todo with a title that is exactly 255 characters
Then the todo is created successfully
```

**Example 2.2: Title exceeds maximum length**
```
Given no todos exist
When I create a todo with a title that is 256 characters
Then creation fails with a validation error
And the error indicates that the title must not exceed 255 characters
```

#### Rule R3 -- A newly created todo starts with status "pending"

**Example 3.1: Default status is pending**
```
Given no todos exist
When I create a todo with title "Buy groceries"
Then the created todo has status "pending"
```

#### Rule R4 -- Each todo receives a unique ID

**Example 4.1: ID is assigned**
```
Given no todos exist
When I create a todo with title "Buy groceries"
Then the created todo has a non-empty string ID
```

**Example 4.2: IDs are unique across todos**
```
Given no todos exist
When I create a todo with title "Buy groceries"
And I create another todo with title "Walk the dog"
Then both todos have different IDs
```

#### Rule R5 -- Each todo records its creation timestamp

**Example 5.1: Timestamp is set**
```
Given no todos exist
When I create a todo with title "Buy groceries"
Then the created todo has a createdAt timestamp
And the timestamp is close to the current time
```

#### Rule R6 -- Title is trimmed

**Example 6.1: Leading and trailing whitespace is removed**
```
Given no todos exist
When I create a todo with title "  Buy groceries  "
Then the created todo has the title "Buy groceries"
```

#### Rules R7, R8, R9 -- HTTP API behavior

**Example 7.1: Successful creation returns 201 with JSON body**
```
Given the API is running
When I POST to /todos with body { "title": "Buy groceries" }
Then the response status is 201
And the response body contains id, title, status, and createdAt
```

**Example 7.2: Validation failure returns 400 with error details**
```
Given the API is running
When I POST to /todos with body { "title": "" }
Then the response status is 400
And the response body contains an error message
```

**Example 7.3: Missing body returns 400**
```
Given the API is running
When I POST to /todos with an empty body
Then the response status is 400
And the response body contains an error message
```

### Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Should the client be able to set an initial status? | No. Status always starts as "pending" per product vision (simple). |
| Should there be a description field? | No. Keep it minimal per product principle "simplicity over features." |
| What ID format? | UUID v4 -- universally unique, no sequential leakage. |
| What timestamp format? | ISO 8601 string in JSON responses; Date object internally. |
| Should duplicate titles be allowed? | Yes. Multiple todos can share the same title. |

---

## Todo Entity Definition

```typescript
interface Todo {
  id: string;          // UUID v4
  title: string;       // 1-255 characters, trimmed
  status: "pending";   // always "pending" on creation
  createdAt: Date;     // set at creation time
}
```

---

## Architecture Layers and File Map

```
src/core/
  domain/
    entities/Todo.ts              -- Todo entity class
    errors/ValidationError.ts     -- Domain validation error
    interfaces/
      repositories/TodoRepository.ts  -- Repository interface (port)
  application/
    use-cases/CreateTodo.ts       -- CreateTodo use case
  infrastructure/
    repositories/InMemoryTodoRepository.ts  -- In-memory implementation
  presentation/
    dtos/CreateTodoDto.ts         -- Request/response DTOs
    controllers/TodoController.ts -- Express controller
    routes/todoRoutes.ts          -- Express route wiring
  __tests__/
    use-cases/CreateTodo.test.ts  -- Sociable unit tests (use case + entity + real repo)
    component/createTodo.component.test.ts  -- Component tests (HTTP through full stack)
    builders/TodoBuilder.ts       -- Test data builder
```

---

## Implementation Tasks

Each task is ordered for incremental, test-driven development. Every task corresponds to one or more tests written first.

### Phase 1: Domain Layer

#### Task 1 -- Todo entity: creation with valid title
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should create a todo with a valid title, pending status, an ID, and a createdAt timestamp"
- **Production files:**
  - `src/core/domain/entities/Todo.ts`
- **Behavior:** Construct a Todo with a valid title. Verify it has a UUID id, the given title (trimmed), status "pending", and a createdAt Date.

#### Task 2 -- Todo entity: reject empty title
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should reject a todo with an empty title"
- **Production files:**
  - `src/core/domain/entities/Todo.ts`
  - `src/core/domain/errors/ValidationError.ts`
- **Behavior:** Creating a Todo with `""` throws a ValidationError with message indicating title is required.

#### Task 3 -- Todo entity: reject whitespace-only title
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should reject a todo with a whitespace-only title"
- **Production files:**
  - `src/core/domain/entities/Todo.ts`
- **Behavior:** Creating a Todo with `"   "` throws a ValidationError.

#### Task 4 -- Todo entity: reject title exceeding 255 characters
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should reject a todo with a title longer than 255 characters"
- **Production files:**
  - `src/core/domain/entities/Todo.ts`
- **Behavior:** Creating a Todo with a 256-character title throws a ValidationError with a message about length.

#### Task 5 -- Todo entity: accept title at exactly 255 characters
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should accept a todo with a title of exactly 255 characters"
- **Production files:**
  - `src/core/domain/entities/Todo.ts`
- **Behavior:** Creating a Todo with exactly 255 characters succeeds.

#### Task 6 -- Todo entity: trim whitespace from title
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should trim leading and trailing whitespace from the title"
- **Production files:**
  - `src/core/domain/entities/Todo.ts`
- **Behavior:** `"  Buy groceries  "` becomes `"Buy groceries"`.

### Phase 2: Application Layer (Use Case with Sociable Tests)

#### Task 7 -- CreateTodo use case: successfully creates and persists a todo
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should create a todo and persist it via the repository"
- **Production files:**
  - `src/core/application/use-cases/CreateTodo.ts`
  - `src/core/domain/interfaces/repositories/TodoRepository.ts`
  - `src/core/infrastructure/repositories/InMemoryTodoRepository.ts`
- **Behavior:** The use case accepts a title, creates a Todo entity, saves it through the repository (using the real InMemoryTodoRepository -- sociable test, no mocks), and returns the created todo. This is a sociable test: it exercises the use case, entity, and repository together.

#### Task 8 -- CreateTodo use case: propagates validation error for empty title
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should throw ValidationError when title is empty"
- **Production files:**
  - `src/core/application/use-cases/CreateTodo.ts`
- **Behavior:** The use case propagates the ValidationError from the entity when given an empty title. Uses real InMemoryTodoRepository (sociable).

#### Task 9 -- CreateTodo use case: IDs are unique across multiple creations
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should assign unique IDs to different todos"
- **Production files:**
  - `src/core/application/use-cases/CreateTodo.ts`
- **Behavior:** Create two todos via the use case, verify they have different IDs. Uses real InMemoryTodoRepository (sociable).

### Phase 3: Infrastructure Layer

#### Task 10 -- InMemoryTodoRepository: save and retrieve
- **Test file:** `src/core/__tests__/use-cases/CreateTodo.test.ts`
- **Test:** "should persist a todo so it can be retrieved" (covered by Task 7 sociable test verifying the save occurred; optionally a focused check that the repository holds the saved item)
- **Production files:**
  - `src/core/infrastructure/repositories/InMemoryTodoRepository.ts`
- **Behavior:** Already built in Task 7; this is about verifying the in-memory store holds what was saved.

### Phase 4: Presentation Layer

#### Task 11 -- TodoController + route: POST /todos returns 201
- **Test file:** `src/core/__tests__/component/createTodo.component.test.ts`
- **Test:** "POST /todos with valid title returns 201 and the created todo"
- **Production files:**
  - `src/core/presentation/dtos/CreateTodoDto.ts`
  - `src/core/presentation/controllers/TodoController.ts`
  - `src/core/presentation/routes/todoRoutes.ts`
  - `src/index.ts` (wire routes)
- **Behavior:** HTTP POST `/todos` with `{ "title": "Buy groceries" }` returns 201 with JSON body `{ id, title, status, createdAt }`. This is a component test using supertest -- it exercises the full vertical slice (HTTP -> controller -> use case -> entity -> repository) with a real in-memory repository.

#### Task 12 -- Component test: POST /todos with empty title returns 400
- **Test file:** `src/core/__tests__/component/createTodo.component.test.ts`
- **Test:** "POST /todos with empty title returns 400 with error message"
- **Production files:**
  - `src/core/presentation/controllers/TodoController.ts` (error handling)
- **Behavior:** HTTP POST `/todos` with `{ "title": "" }` returns 400 with JSON error body.

#### Task 13 -- Component test: POST /todos with missing title returns 400
- **Test file:** `src/core/__tests__/component/createTodo.component.test.ts`
- **Test:** "POST /todos with missing title returns 400 with error message"
- **Production files:**
  - `src/core/presentation/controllers/TodoController.ts`
- **Behavior:** HTTP POST `/todos` with `{}` returns 400 with a descriptive error.

#### Task 14 -- Component test: POST /todos with title exceeding 255 chars returns 400
- **Test file:** `src/core/__tests__/component/createTodo.component.test.ts`
- **Test:** "POST /todos with title over 255 characters returns 400 with error message"
- **Production files:**
  - (no new production code -- covered by existing validation)
- **Behavior:** HTTP POST `/todos` with overly long title returns 400.

### Phase 5: Test Helpers

#### Task 15 -- TodoBuilder test data builder
- **Test file:** `src/core/__tests__/builders/TodoBuilder.ts`
- **Production files:** None (test infrastructure only)
- **Behavior:** A builder class that produces Todo instances with sensible defaults, allowing override of any field. Used by tests to reduce boilerplate. This can be introduced at any point during development when tests start to benefit from it.

---

## Implementation Order Summary

```
Task  1: Todo entity -- valid creation               [domain]
Task  2: Todo entity -- reject empty title            [domain]
Task  3: Todo entity -- reject whitespace-only title  [domain]
Task  4: Todo entity -- reject title > 255 chars      [domain]
Task  5: Todo entity -- accept title = 255 chars      [domain]
Task  6: Todo entity -- trim whitespace               [domain]
Task  7: CreateTodo use case -- happy path (sociable)  [application + infrastructure]
Task  8: CreateTodo use case -- empty title error      [application]
Task  9: CreateTodo use case -- unique IDs             [application]
Task 10: InMemoryTodoRepository -- verify persistence  [infrastructure]
Task 11: POST /todos 201 -- component test             [presentation]
Task 12: POST /todos 400 empty title -- component test [presentation]
Task 13: POST /todos 400 missing title -- component    [presentation]
Task 14: POST /todos 400 title too long -- component   [presentation]
Task 15: TodoBuilder -- test data builder              [test infra]
```

---

## Test Strategy

### Sociable Unit Tests (`CreateTodo.test.ts`)
- Exercise the CreateTodo use case with real collaborators (Todo entity, InMemoryTodoRepository).
- No mocks. The use case, entity validation, and repository persistence are tested together as a cohesive unit.
- Focus: business rules and domain logic correctness.

### Component Tests (`createTodo.component.test.ts`)
- Use `supertest` to send real HTTP requests to the Express app.
- The full vertical slice is exercised: HTTP request -> Express route -> controller -> use case -> entity -> in-memory repository -> HTTP response.
- No mocks. A fresh InMemoryTodoRepository is used per test (or per suite).
- Focus: API contract (status codes, response shapes, error formats).

### No Solitary Unit Tests
- For this simple feature, solitary (mocked) unit tests add no value. The sociable tests already cover the use case and entity together, and the component tests cover the full stack.

---

## Acceptance Criteria Checklist

- [ ] POST /todos with a valid title returns 201 and the todo with id, title, status, createdAt
- [ ] The created todo has status "pending"
- [ ] The created todo has a UUID id
- [ ] The created todo has a createdAt timestamp
- [ ] Title is trimmed of whitespace
- [ ] POST /todos with empty string title returns 400 with error
- [ ] POST /todos with whitespace-only title returns 400 with error
- [ ] POST /todos with missing title returns 400 with error
- [ ] POST /todos with title > 255 characters returns 400 with error
- [ ] POST /todos with title of exactly 255 characters returns 201
- [ ] All tests pass with no mocks
