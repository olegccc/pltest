# Development Guide

## Development

### Development Mode (Recommended)

Run the full stack with hot module replacement:

```bash
yarn dev
```

This starts the backend server at http://localhost:3000, which:

- Serves the frontend with Vite HMR
- Provides API endpoints at `/api/*`
- Auto-reloads on backend code changes
- Hot-reloads frontend on code changes

### Frontend Standalone Development

For frontend-only development:

```bash
cd packages/frontend
yarn dev
```

Frontend runs at http://localhost:3001

**Note**: You'll need the backend running separately to make API calls.

### Working with Shared Package

The `shared` package contains TypeScript types and interfaces. After modifying it:

```bash
yarn build:shared
```

The shared package doesn't have hot reload, so manual rebuilds are required.

## Building for Production

Build all packages:

```bash
yarn build
```

This builds in order:

1. `shared` - TypeScript types and interfaces
2. `frontend` - React application (outputs to `packages/frontend/dist`)
3. `backend` - Express server (outputs to `packages/backend/dist`)

Build individual packages:

```bash
yarn build:shared
yarn build:frontend
yarn build:backend
```

## Testing

Run all tests across frontend and backend:

```bash
yarn test
```

Run tests for specific packages:

```bash
yarn test:frontend  # Run frontend tests (React components, UI logic)
yarn test:backend   # Run backend tests (metrics computation, API)
```

### Frontend Tests

Frontend uses Vitest with React Testing Library:

- Component rendering tests
- User interaction tests
- API integration tests (mocked)
- All tests use `data-testid` attributes for reliable element selection

### Backend Tests

Backend tests cover:

- CSV parsing and data loading
- Metrics aggregation logic
- API endpoint behavior
- AI service integration

### Watch Mode

For TDD during development:

```bash
cd packages/frontend && yarn test  # Frontend watch mode
cd packages/backend && yarn test    # Backend watch mode
```

## Code Quality

### Linting

ESLint configuration with TypeScript, React, and Prettier integration.

Check for issues:

```bash
yarn lint
```

Auto-fix issues:

```bash
yarn lint:fix
```

### Formatting

Prettier is used for consistent code formatting.

Format all files:

```bash
yarn format
```

Check formatting without changes:

```bash
yarn format:check
```

## Project Structure

```
pltest/
├── packages/
│   ├── backend/
│   │   ├── data/
│   │   │   └── events.csv          # Event data
│   │   ├── model/                  # LLM models (optional)
│   │   ├── scripts/
│   │   │   └── download-model.ts   # Model download utility
│   │   ├── src/
│   │   │   ├── controllers/        # API controllers
│   │   │   ├── routes/             # Express routes
│   │   │   ├── services/           # Business logic
│   │   │   │   ├── db.ts           # Database service
│   │   │   │   ├── userMetrics.ts  # Metrics computation
│   │   │   │   ├── localAi.ts      # LLM integration
│   │   │   │   ├── pseudoAi.ts     # Rule-based explanations
│   │   │   │   └── prompt.ts       # Prompt engineering
│   │   │   └── server.ts           # Express app setup
│   │   ├── .env                    # Environment config
│   │   └── package.json
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── UserDetails/    # User metrics display
│   │   │   │   ├── UserList/       # User selection
│   │   │   │   └── shared/         # Reusable components
│   │   │   ├── services/
│   │   │   │   └── api.ts          # API client
│   │   │   ├── store/
│   │   │   │   └── store.ts        # Zustand state
│   │   │   ├── pages/
│   │   │   │   └── Home.tsx        # Main page
│   │   │   └── App.tsx
│   │   ├── test/
│   │   │   └── setup.ts            # Test configuration
│   │   └── package.json
│   │
│   └── shared/
│       ├── src/
│       │   └── types.ts            # Shared TypeScript types
│       └── package.json
│
├── .nvmrc                          # Node version
├── package.json                    # Root workspace config
└── README.md
```

## Troubleshooting

### "Cannot find module 'shared'"

Run `yarn build:shared` to compile the shared package.

### Port 3000 already in use

Change the port in `packages/backend/.env`:

```bash
PORT=3001
```

### Frontend not loading

Make sure you ran `yarn build` before `yarn dev` on first setup.

### AI explanations not working

This is expected if you haven't set up a local model. The application falls back to rule-based explanations automatically.

### Tests failing

Ensure all packages are built:

```bash
yarn build
```
