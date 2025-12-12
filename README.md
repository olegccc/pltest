# Event Analytics Dashboard

A full-stack event analytics application that provides user behavior insights through aggregated metrics and AI-powered explanations. The system ingests user event data from CSV files, computes comprehensive metrics per user, and presents them through an interactive web interface with natural language explanations.

This application demonstrates a complete vertical slice of data ingestion, backend API development, AI integration, and frontend visualization. It processes user events (views, clicks, purchases) to generate actionable insights including event counts by type, temporal patterns, value aggregations, and AI-generated natural language summaries that help understand user behavior patterns.

## Features

- **CSV Data Ingestion**: Automatically loads and parses event data from CSV files on startup
- **User Metrics Aggregation**: Computes comprehensive metrics per user including:
  - Total event counts
  - Events grouped by type (view, click, purchase)
  - Events grouped by day
  - Total and average value calculations
- **RESTful API**: Exposes endpoints to query users and their metrics
- **AI-Powered Explanations**: Generates natural language explanations of user behavior patterns
  - Supports local LLM integration (optional)
  - Falls back to rule-based explanation generator
- **Interactive Web UI**: React-based dashboard with user selection, metrics visualization, and AI explanations
- **Type Safety**: Full TypeScript implementation across frontend, backend, and shared packages

## Architecture

This is a Yarn monorepo with three packages:

- **backend**: Express.js server with:
  - CSV data loader and parser
  - SQLite database for efficient metrics queries
  - User metrics computation service
  - AI/LLM integration for natural language explanations
  - REST API endpoints for users and metrics
  - Vite middleware for serving the frontend with HMR

- **frontend**: React application with:
  - Chakra UI component library
  - Zustand for state management
  - User selection interface
  - Metrics visualization components
  - AI explanation display
  - Comprehensive test coverage with Vitest

- **shared**: Shared TypeScript types for:
  - Type safety across frontend and backend
  - Consistent data structures between packages

## Data Flow

1. Backend loads `events.csv` on startup
2. Events are parsed and stored in SQLite database
3. Metrics are computed per user and cached
4. Frontend fetches user list via `GET /api/users`
5. User selection triggers `GET /api/users/{user_id}/metrics`
6. "Explain" button calls `POST /api/users/{user_id}/explain`
7. Backend uses LLM (or rule-based service) to generate explanation
8. Frontend displays metrics and explanation to user

## Prerequisites

- Node.js >= 24.0.0 (check `.nvmrc` for exact version)
- Yarn package manager (v4.12.0)

## Quick Start

1. **Install dependencies**:

   ```bash
   yarn install
   ```

2. **Build the project** (required on first run):

   ```bash
   yarn build
   ```

3. **Run the application**:

   ```bash
   yarn dev
   ```

4. **Open your browser** to http://localhost:3000

The application will:

- Load event data from `packages/backend/data/events.csv`
- Start the backend API server
- Serve the frontend with hot module replacement
- Use rule-based AI explanations (no LLM setup required)

## Configuration

### Backend Environment Variables

Create `packages/backend/.env` (or copy from `.env.example`):

```bash
# Server port
PORT=3000

# Path to events CSV file (relative to backend package)
CSV_PATH=data/events.csv

# Optional: Local LLM model path (see AI Model Setup below)
LOCAL_MODEL=
```

### CSV Data Format

The application expects a CSV file with the following columns:

- `event_id`: Unique identifier for the event
- `user_id`: Unique identifier for the user
- `event_type`: Type of event (e.g., view, click, purchase)
- `timestamp`: ISO 8601 timestamp (e.g., 2025-01-01T12:34:56Z)
- `value`: Numeric value associated with the event

A sample `events.csv` is included in `packages/backend/data/`.

### AI Model Setup (Optional)

By default, the application uses a rule-based explanation generator. To enable real LLM-powered explanations:

1. **Download a model**:

   ```bash
   cd packages/backend
   yarn download-model
   ```

   This will:
   - Download `unsloth/gemma-3-270m-it-GGUF` from Hugging Face
   - Save it to `packages/backend/model/`
   - Update `.env` with the model path

2. **Or specify a different model**:

   ```bash
   yarn download-model "TheBloke/Mistral-7B-Instruct-v0.2-GGUF"
   ```

3. **Restart the server** to use the LLM

**Note**: If no model is configured, the application automatically falls back to rule-based explanations. Both approaches work equally well for demonstration purposes.

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

## API Endpoints

The backend exposes the following REST API endpoints:

### `GET /api/users`

Returns list of all user IDs.

**Response**:

```json
{
  "userIds": ["user123", "user456", ...]
}
```

### `GET /api/users/:userId/metrics`

Returns aggregated metrics for a specific user.

**Response**:

```json
{
  "user_id": "user123",
  "total_events": 155,
  "events_per_type": {
    "view": 120,
    "click": 30,
    "purchase": 5
  },
  "total_value": 742.50,
  "avg_value": 4.79,
  "events_per_day": {
    "2025-01-01": 40,
    "2025-01-02": 23,
    ...
  }
}
```

### `POST /api/users/:userId/explain`

Generates a natural language explanation of the user's metrics.

**Response**:

```json
{
  "explanation": "User user123 is highly active with 155 total events..."
}
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
