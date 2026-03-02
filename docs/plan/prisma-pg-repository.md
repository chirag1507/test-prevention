# Enhancement Plan: Replace In-Memory Repository with PostgreSQL/Prisma

## User Story

**As** a developer,
**I want to** persist todos in PostgreSQL,
**so that** data survives server restarts and the application is production-ready.

---

## Example Mapping

### Business Rules

| # | Rule |
|---|------|
| R1 | Todos persist across server restarts (PostgreSQL storage) |
| R2 | The Prisma schema matches the Todo entity (id UUID PK, title string, status string, createdAt DateTime) |
| R3 | The repository interface stays unchanged -- only the adapter changes |
| R4 | Tests use an appropriate strategy (unit tests keep InMemoryTodoRepository, narrow integration test for Prisma adapter, component tests use InMemoryTodoRepository, system tests use real PostgreSQL) |

### Examples (Given-When-Then)

#### Rule R1 -- Todos persist across server restarts

**Example 1.1: Todo survives save and retrieval via PostgreSQL**
```
Given a PostgreSQL database is running
When I save a todo with title "Buy groceries" through PrismaTodoRepository
Then I can retrieve it by ID
And it has the title "Buy groceries", status "pending", and a createdAt timestamp
```

**Example 1.2: Non-existent todo returns undefined**
```
Given a PostgreSQL database is running
When I look up a todo by a non-existent ID through PrismaTodoRepository
Then I receive undefined
```

#### Rule R2 -- Prisma schema matches the Todo entity

**Example 2.1: Prisma Todo model has all required fields**
```
Given the Prisma schema is defined
Then the Todo model has:
  - id: String (UUID, primary key, default uuid)
  - title: String (max 255 characters)
  - status: String
  - createdAt: DateTime (default now)
```

#### Rule R3 -- Repository interface is unchanged

**Example 3.1: PrismaTodoRepository implements TodoRepository**
```
Given the TodoRepository interface defines save(todo) and findById(id)
When I create a PrismaTodoRepository
Then it implements the same interface
And no domain or application code changes
```

#### Rule R4 -- Test strategy is appropriate per layer

**Example 4.1: Sociable unit tests remain fast with InMemoryTodoRepository**
```
Given the existing sociable unit tests in CreateTodo.test.ts
When I run them
Then they still use InMemoryTodoRepository
And they do not require a database
```

**Example 4.2: Narrow integration tests verify real database behavior**
```
Given a PostgreSQL database is running
When I run the PrismaTodoRepository integration tests
Then they exercise save and findById against the real database
```

**Example 4.3: Component tests remain fast with InMemoryTodoRepository**
```
Given the existing component tests in createTodo.component.test.ts
When I run them
Then they use InMemoryTodoRepository via createApp()
And they do not require a database
```

### Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Where does the Prisma schema live? | `src/core/infrastructure/prisma/schema.prisma` -- keeps infrastructure concerns in the infrastructure layer. |
| How do narrow integration tests get a database? | Docker Compose provides a test PostgreSQL instance. Tests connect to it directly. |
| Should createApp() default to InMemory or Prisma? | It takes a repository parameter. A separate factory function wires the production configuration. |
| Should the Prisma client be created inside the repository or injected? | Injected via constructor for testability and lifecycle control. |
| What about Prisma migrations in CI? | `prisma migrate deploy` runs before integration tests. A `docker-compose.test.yml` provides the database. |

---

## Architecture

### Current State

```
src/core/infrastructure/
  repositories/
    InMemoryTodoRepository.ts    (hardwired in createApp)
```

`createApp()` in `src/index.ts` directly instantiates `InMemoryTodoRepository`.

### Target State

```
src/core/infrastructure/
  repositories/
    InMemoryTodoRepository.ts    (KEEP -- used in tests)
    PrismaTodoRepository.ts      (NEW -- production adapter)
  prisma/
    schema.prisma                (NEW -- Prisma schema with Todo model)
```

`createApp()` in `src/index.ts` accepts a `TodoRepository` parameter (dependency injection). A production entry point wires `PrismaTodoRepository`; tests wire `InMemoryTodoRepository`.

### What Changes, What Does Not

| Layer | Changes? | Details |
|-------|----------|---------|
| Domain (`entities/Todo.ts`, `errors/ValidationError.ts`) | NO | The entity and its validation rules are unchanged. |
| Domain interfaces (`TodoRepository.ts`) | NO | The port stays exactly the same: `save(todo)` and `findById(id)`. |
| Application (`CreateTodo.ts`) | NO | The use case depends on the `TodoRepository` interface, not a concrete class. |
| Presentation (`TodoController.ts`, `todoRoutes.ts`) | NO | Controllers and routes are unaware of the repository implementation. |
| Infrastructure (`InMemoryTodoRepository.ts`) | NO | Kept as-is for use in tests. |
| Infrastructure (NEW: `PrismaTodoRepository.ts`) | NEW | Implements `TodoRepository` using Prisma Client. |
| Infrastructure (NEW: `schema.prisma`) | NEW | Defines the Todo model for PostgreSQL. |
| Wiring (`src/index.ts`) | YES | `createApp()` accepts a repository parameter instead of hardwiring one. |
| Test files | MINIMAL | Component and system tests pass the InMemoryTodoRepository explicitly. New narrow integration test added. |

This is the power of Clean Architecture: swapping a persistence adapter requires zero changes to domain, application, or presentation layers.

---

## Test Strategy

### Existing Sociable Unit Tests (`src/core/__tests__/use-cases/CreateTodo.test.ts`)

**Status:** UNCHANGED

These tests exercise domain logic (Todo entity validation) and the CreateTodo use case with a real `InMemoryTodoRepository`. They test business rules, not persistence technology. They remain fast, require no database, and need no modifications.

### NEW Narrow Integration Tests (`src/core/__tests__/integration/PrismaTodoRepository.integration.test.ts`)

**Status:** NEW

These tests verify that `PrismaTodoRepository` correctly translates between the domain `Todo` entity and PostgreSQL via Prisma. They run against a real PostgreSQL database (provided by Docker Compose).

What they test:
- `save()` persists a Todo and returns it with all fields intact
- `findById()` retrieves a previously saved Todo with correct field values
- `findById()` returns `undefined` for a non-existent ID
- Data round-trips correctly (UUID id, string title, string status, DateTime createdAt)

What they do NOT test:
- Domain validation (that is the entity's job, tested in unit tests)
- HTTP behavior (that is the component test's job)

### Existing Component Tests (`src/core/__tests__/component/createTodo.component.test.ts`)

**Status:** MINOR UPDATE

These tests exercise the full HTTP vertical slice using supertest. They currently call `createApp()` which hardwires `InMemoryTodoRepository`. After the refactor, they will call `createApp(new InMemoryTodoRepository())` to explicitly pass the in-memory repository. The tests themselves remain fast and database-free.

### Existing System Tests (`system-tests/test-cases/todo/create-todo.test.ts`)

**Status:** UPDATE — USE REAL DATABASE

System tests are acceptance tests that verify the system in a production-like environment. They should use the real PostgreSQL database via `PrismaTodoRepository`, not the in-memory stub. Only external systems (payment gateways, email services, etc.) should be mocked — the database is an internal dependency that should be real. The `TodoApiDriver` will be updated to wire `PrismaTodoRepository` with a real `PrismaClient` connected to the test database.

### Test Pyramid Summary

```
                    +-------------------+
                    |  System Tests     |  <-- PrismaTodoRepository (real DB)
                    +-------------------+
                  +-----------------------+
                  |  Component Tests      |  <-- InMemoryTodoRepository (fast, no DB)
                  +-----------------------+
              +-----------------------------+
              | Narrow Integration Tests    |  <-- PrismaTodoRepository (real DB)
              +-----------------------------+
          +-------------------------------------+
          |  Sociable Unit Tests                |  <-- InMemoryTodoRepository (fast, no DB)
          +-------------------------------------+
```

---

## Implementation Tasks

Each task is ordered for incremental, test-driven development.

### Phase 1: Prisma Setup

#### Task 1 -- Install Prisma dependencies

- **Action:** Add `prisma` (devDependency) and `@prisma/client` (dependency) to `package.json`.
- **Commands:**
  ```bash
  npm install @prisma/client
  npm install --save-dev prisma
  ```
- **Verification:** `npx prisma --version` outputs a version number.
- **Files modified:**
  - `/home/av19/Projects/test-prevention/package.json`

#### Task 2 -- Initialize Prisma with PostgreSQL provider

- **Action:** Run `npx prisma init` with PostgreSQL as the provider. Move the generated `schema.prisma` to `src/core/infrastructure/prisma/schema.prisma`. Configure `package.json` to point Prisma at the custom schema location.
- **Commands:**
  ```bash
  npx prisma init --datasource-provider postgresql
  ```
- **Post-setup:** Move `prisma/schema.prisma` to `src/core/infrastructure/prisma/schema.prisma`. Add to `package.json`:
  ```json
  "prisma": {
    "schema": "src/core/infrastructure/prisma/schema.prisma"
  }
  ```
- **Create `.env` file** (or update if it exists) with a placeholder `DATABASE_URL`:
  ```
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_prevention?schema=public"
  ```
- **Verification:** `npx prisma validate` succeeds.
- **Files created/modified:**
  - `/home/av19/Projects/test-prevention/src/core/infrastructure/prisma/schema.prisma`
  - `/home/av19/Projects/test-prevention/.env`
  - `/home/av19/Projects/test-prevention/package.json`

#### Task 3 -- Create Todo model in Prisma schema

- **Action:** Define the `Todo` model in the Prisma schema with fields matching the domain entity.
- **Schema:**
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  generator client {
    provider = "prisma-client-js"
  }

  model Todo {
    id        String   @id @default(uuid()) @db.Uuid
    title     String   @db.VarChar(255)
    status    String   @db.VarChar(50)
    createdAt DateTime @default(now())
  }
  ```
- **Verification:** `npx prisma validate` succeeds. `npx prisma generate` produces the Prisma Client.
- **Files modified:**
  - `/home/av19/Projects/test-prevention/src/core/infrastructure/prisma/schema.prisma`

### Phase 2: Docker Compose for Test Database

#### Task 4 -- Create Docker Compose file for test PostgreSQL

- **Action:** Create a `docker-compose.test.yml` that runs a PostgreSQL instance for integration tests.
- **File content:**
  ```yaml
  version: "3.8"
  services:
    test-db:
      image: postgres:16-alpine
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: test_prevention_test
      ports:
        - "5433:5432"
      tmpfs:
        - /var/lib/postgresql/data
  ```
- **Notes:** Port 5433 avoids conflicts with any local PostgreSQL on 5432. `tmpfs` makes the test database ephemeral (fast, no disk writes). Add a `test:integration` script to `package.json`:
  ```json
  "test:integration": "DATABASE_URL='postgresql://postgres:postgres@localhost:5433/test_prevention_test?schema=public' jest --testPathPattern=integration"
  ```
- **Verification:** `docker compose -f docker-compose.test.yml up -d` starts the database. `docker compose -f docker-compose.test.yml down` stops it.
- **Files created/modified:**
  - `/home/av19/Projects/test-prevention/docker-compose.test.yml`
  - `/home/av19/Projects/test-prevention/package.json`

### Phase 3: Narrow Integration Tests (TDD -- test first)

#### Task 5 -- Write narrow integration test: save and retrieve a Todo

- **Test file:** `/home/av19/Projects/test-prevention/src/core/__tests__/integration/PrismaTodoRepository.integration.test.ts`
- **Test:** "should save a todo and retrieve it by ID"
- **Behavior:** Create a `Todo` via `Todo.create('Buy groceries')`, call `repository.save(todo)`, then call `repository.findById(todo.id)`. Assert the retrieved todo has the same id, title, status, and a createdAt that is a Date instance.
- **Test skeleton:**
  ```typescript
  import { PrismaClient } from '@prisma/client';
  import { PrismaTodoRepository } from '../../infrastructure/repositories/PrismaTodoRepository';
  import { Todo } from '../../domain/entities/Todo';

  describe('PrismaTodoRepository', () => {
    let prisma: PrismaClient;
    let repository: PrismaTodoRepository;

    beforeAll(async () => {
      prisma = new PrismaClient();
      await prisma.$connect();
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
  });
  ```
- **Expected result at this point:** Test fails (PrismaTodoRepository does not exist yet). This is the RED phase.
- **Files created:**
  - `/home/av19/Projects/test-prevention/src/core/__tests__/integration/PrismaTodoRepository.integration.test.ts`

#### Task 6 -- Write narrow integration test: findById returns undefined for non-existent ID

- **Test file:** `/home/av19/Projects/test-prevention/src/core/__tests__/integration/PrismaTodoRepository.integration.test.ts`
- **Test:** "should return undefined when todo does not exist"
- **Behavior:** Call `repository.findById('non-existent-uuid')` on an empty database. Assert the result is `undefined`.
- **Test code:**
  ```typescript
  it('should return undefined when todo does not exist', async () => {
    const found = await repository.findById('00000000-0000-0000-0000-000000000000');

    expect(found).toBeUndefined();
  });
  ```
- **Expected result at this point:** Test fails (PrismaTodoRepository does not exist yet). Still RED.
- **Files modified:**
  - `/home/av19/Projects/test-prevention/src/core/__tests__/integration/PrismaTodoRepository.integration.test.ts`

### Phase 4: Production Code (GREEN phase)

#### Task 7 -- Implement PrismaTodoRepository

- **Production file:** `/home/av19/Projects/test-prevention/src/core/infrastructure/repositories/PrismaTodoRepository.ts`
- **Behavior:** Implements `TodoRepository` using Prisma Client. The `save` method inserts a row via `prisma.todo.create()`. The `findById` method queries via `prisma.todo.findUnique()` and returns `undefined` if not found.
- **Key design decisions:**
  - The `PrismaClient` is injected via constructor (not created internally) for testability and lifecycle control.
  - The `save` method maps from the domain `Todo` entity to the Prisma create input (all fields explicit -- the domain entity owns ID and timestamp generation, not the database defaults).
  - The `findById` method maps from the Prisma result back to a domain `Todo` entity using a reconstitution method.
- **Implementation:**
  ```typescript
  import { PrismaClient } from '@prisma/client';
  import { Todo } from '../../domain/entities/Todo';
  import { TodoRepository } from '../../domain/interfaces/repositories/TodoRepository';

  export class PrismaTodoRepository implements TodoRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async save(todo: Todo): Promise<Todo> {
      await this.prisma.todo.create({
        data: {
          id: todo.id,
          title: todo.title,
          status: todo.status,
          createdAt: todo.createdAt,
        },
      });
      return todo;
    }

    async findById(id: string): Promise<Todo | undefined> {
      const record = await this.prisma.todo.findUnique({
        where: { id },
      });

      if (!record) {
        return undefined;
      }

      return Todo.reconstitute({
        id: record.id,
        title: record.title,
        status: record.status,
        createdAt: record.createdAt,
      });
    }
  }
  ```
- **Domain entity change required:** The `Todo` class needs a static `reconstitute` method to rebuild a `Todo` from persisted data without re-running validation or generating a new ID. This is a common Clean Architecture pattern for hydrating entities from storage.
  ```typescript
  // Add to src/core/domain/entities/Todo.ts
  static reconstitute(props: { id: string; title: string; status: string; createdAt: Date }): Todo {
    return new Todo(props.id, props.title, props.status, props.createdAt);
  }
  ```
- **Expected result:** Both integration tests pass. GREEN.
- **Files created:**
  - `/home/av19/Projects/test-prevention/src/core/infrastructure/repositories/PrismaTodoRepository.ts`
- **Files modified:**
  - `/home/av19/Projects/test-prevention/src/core/domain/entities/Todo.ts` (add `reconstitute` static method)

#### Task 8 -- Create Prisma migration

- **Action:** Generate and apply the initial Prisma migration.
- **Commands:**
  ```bash
  npx prisma migrate dev --name init-todo
  ```
- **Verification:** Migration file is created under `src/core/infrastructure/prisma/migrations/`. The test database schema is up to date.
- **For CI/test runs:**
  ```bash
  npx prisma migrate deploy
  ```
- **Files created:**
  - `/home/av19/Projects/test-prevention/src/core/infrastructure/prisma/migrations/<timestamp>_init_todo/migration.sql`

### Phase 5: Wiring (Dependency Injection)

#### Task 9 -- Update createApp() to accept a repository parameter

- **Production file:** `/home/av19/Projects/test-prevention/src/index.ts`
- **Current code:**
  ```typescript
  export function createApp(): Express {
    const app = express();
    app.use(express.json());
    // ...
    const repository = new InMemoryTodoRepository();
    const createTodo = new CreateTodo(repository);
    // ...
  }
  ```
- **New code:**
  ```typescript
  import { TodoRepository } from './core/domain/interfaces/repositories/TodoRepository';

  export function createApp(repository: TodoRepository): Express {
    const app = express();
    app.use(express.json());
    // ...
    const createTodo = new CreateTodo(repository);
    // ...
  }
  ```
- **Key change:** `createApp()` no longer knows about `InMemoryTodoRepository` or `PrismaTodoRepository`. It depends only on the `TodoRepository` interface. The caller decides which implementation to inject.
- **Files modified:**
  - `/home/av19/Projects/test-prevention/src/index.ts`

#### Task 10 -- Create production entry point that wires PrismaTodoRepository

- **Action:** Update the direct-execution block in `src/index.ts` to wire the `PrismaTodoRepository` for production.
- **Updated production wiring in `src/index.ts`:**
  ```typescript
  import { PrismaClient } from '@prisma/client';
  import { PrismaTodoRepository } from './core/infrastructure/repositories/PrismaTodoRepository';

  const isDirectExecution = process.env.NODE_ENV !== 'test';

  if (isDirectExecution) {
    const prisma = new PrismaClient();
    const repository = new PrismaTodoRepository(prisma);
    const app = createApp(repository);
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
  ```
- **Files modified:**
  - `/home/av19/Projects/test-prevention/src/index.ts`

#### Task 11 -- Update component tests to pass InMemoryTodoRepository explicitly

- **Test file:** `/home/av19/Projects/test-prevention/src/core/__tests__/component/createTodo.component.test.ts`
- **Current code:**
  ```typescript
  const app = createApp();
  ```
- **New code:**
  ```typescript
  import { InMemoryTodoRepository } from '../../infrastructure/repositories/InMemoryTodoRepository';

  const app = createApp(new InMemoryTodoRepository());
  ```
- **Verification:** All component tests still pass. No behavioral changes.
- **Files modified:**
  - `/home/av19/Projects/test-prevention/src/core/__tests__/component/createTodo.component.test.ts`

#### Task 12 -- Update system test driver to use PrismaTodoRepository with real database

- **Test file:** `/home/av19/Projects/test-prevention/system-tests/drivers/api/todo-api.driver.ts`
- **Behavior:** System tests are acceptance tests that should run against a production-like environment. The driver will wire `PrismaTodoRepository` with a real `PrismaClient` connected to the test PostgreSQL database. Only external systems should be mocked — the database is internal.
- **New code:**
  ```typescript
  import { PrismaClient } from '@prisma/client';
  import { PrismaTodoRepository } from '../../../src/core/infrastructure/repositories/PrismaTodoRepository';

  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    const repository = new PrismaTodoRepository(this.prisma);
    this.app = createApp(repository);
  }

  async cleanup(): Promise<void> {
    this.createdTodos = [];
    await this.prisma.todo.deleteMany();
  }
  ```
- **Verification:** All system tests pass against the real PostgreSQL database.
- **Note:** System tests require the test database to be running (`docker compose -f docker-compose.test.yml up -d`) and migrations applied (`npx prisma migrate deploy`).
- **Files modified:**
  - `/home/av19/Projects/test-prevention/system-tests/drivers/api/todo-api.driver.ts`

---

## Implementation Order Summary

```
Phase 1: Prisma Setup
  Task  1: Install Prisma dependencies                          [infrastructure]
  Task  2: Initialize Prisma with PostgreSQL provider           [infrastructure]
  Task  3: Create Todo model in Prisma schema                   [infrastructure]

Phase 2: Docker Compose for Test Database
  Task  4: Create Docker Compose file for test PostgreSQL       [infrastructure]

Phase 3: Narrow Integration Tests (RED)
  Task  5: Write integration test -- save and retrieve          [test]
  Task  6: Write integration test -- findById returns undefined [test]

Phase 4: Production Code (GREEN)
  Task  7: Implement PrismaTodoRepository + Todo.reconstitute   [infrastructure + domain]
  Task  8: Create Prisma migration                              [infrastructure]

Phase 5: Wiring (Dependency Injection)
  Task  9: Update createApp() to accept repository parameter    [wiring]
  Task 10: Create production entry point with PrismaTodoRepository [wiring]
  Task 11: Update component tests to pass InMemoryTodoRepository   [test update]
  Task 12: Update system test driver to use PrismaTodoRepository + real DB [test update]
```

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Keep `InMemoryTodoRepository` | Fast tests that do not need a database should remain fast. The in-memory implementation is perfect for unit and component tests that test business logic and HTTP contracts. System tests use the real database for production-like verification. |
| `PrismaTodoRepository` tested with narrow integration test | The repository adapter is the boundary between the application and the database. It deserves its own focused test against a real database to verify the mapping is correct. |
| `createApp()` becomes configurable via dependency injection | This is the Dependency Inversion Principle in action. The composition root (entry point) decides which implementation to use, not the application code. |
| `PrismaClient` injected into repository constructor | Allows test setup/teardown to control the Prisma client lifecycle. Avoids global state. |
| `Todo.reconstitute()` static method | Entities need a way to be rebuilt from persisted data without re-running creation validation or generating new IDs. This is a standard Clean Architecture pattern for hydration. |
| Docker Compose for test PostgreSQL | Provides a reproducible, isolated database for integration tests. `tmpfs` keeps it fast. Port 5433 avoids conflicts. |
| Prisma schema in `src/core/infrastructure/prisma/` | Keeps the database schema co-located with the infrastructure layer where it logically belongs. |

---

## Acceptance Criteria Checklist

- [ ] `PrismaTodoRepository` implements `TodoRepository` interface
- [ ] `PrismaTodoRepository.save()` persists a Todo to PostgreSQL
- [ ] `PrismaTodoRepository.findById()` retrieves a Todo from PostgreSQL
- [ ] `PrismaTodoRepository.findById()` returns `undefined` for non-existent IDs
- [ ] Prisma schema defines Todo model with id (UUID PK), title (varchar 255), status (varchar), createdAt (datetime)
- [ ] `createApp()` accepts a `TodoRepository` parameter (dependency injection)
- [ ] Production entry point wires `PrismaTodoRepository`
- [ ] Narrow integration tests pass against a real PostgreSQL database
- [ ] All existing sociable unit tests pass without modification (no DB required)
- [ ] All existing component tests pass with `InMemoryTodoRepository` passed explicitly
- [ ] All existing system tests pass with `PrismaTodoRepository` against real PostgreSQL
- [ ] No domain or application layer code changes (except `Todo.reconstitute`)
- [ ] Docker Compose provides a test PostgreSQL instance
- [ ] Prisma migration is created and can be applied
