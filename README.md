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

## Design

See [DESIGN.md](DESIGN.md) for architecture, data flow, CSV data format, and API endpoints.

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

See [DEVELOPMENT.md](DEVELOPMENT.md) for:
- Development workflow and modes
- Building for production
- Testing (frontend, backend, watch mode)
- Code quality (linting, formatting)
- Project structure
- Troubleshooting
