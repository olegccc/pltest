# Design Documentation

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

## CSV Data Format

The application expects a CSV file with the following columns:

- `event_id`: Unique identifier for the event
- `user_id`: Unique identifier for the user
- `event_type`: Type of event (e.g., view, click, purchase)
- `timestamp`: ISO 8601 timestamp (e.g., 2025-01-01T12:34:56Z)
- `value`: Numeric value associated with the event

A sample `events.csv` is included in `packages/backend/data/`.

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
