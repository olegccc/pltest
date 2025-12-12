# AI Explanation Component

The AI explanation feature provides natural language insights about user behavior patterns. Here's how it works:

## Frontend Components

**AiExplanation.tsx**: Presentational component that displays:
- A button to trigger explanation generation
- Loading state during generation
- Error alerts if generation fails
- The generated explanation text in a styled container

**UserDetails.tsx**: Container component that:
1. Manages the explanation state (loading, error, result)
2. Calls the backend API endpoint `POST /api/users/{user_id}/explain`
3. Passes the explanation data to the `AiExplanation` component for display
4. Resets explanation state when switching users

## Backend Services

The backend controller (`controllers/users.ts`) implements the explanation endpoint with a flexible AI service architecture:

1. **Fetches user metrics** for the requested user
2. **Checks if a local LLM is available** (`localAiService.available()`)
3. **Generates explanation** using one of two strategies:
   - **Local LLM** (if configured): Uses `node-llama-cpp` to run a local language model with a structured prompt
   - **Pseudo AI** (fallback): Uses rule-based heuristics to analyze metrics and generate explanations based on activity levels, dominant event types, value patterns, and temporal behavior

## Service Architecture

**LocalAiService** (`services/localAi.ts`):
- Loads a local GGUF model using `node-llama-cpp`
- Returns `available()` as `false` if no model is configured
- Provides a `prompt()` method to generate LLM responses

**PseudoAiService** (`services/pseudoAi.ts`):
- Analyzes metrics using statistical heuristics
- Classifies activity levels (high/moderate/low)
- Identifies dominant event types and patterns
- Generates structured natural language explanations

**PromptService** (`services/prompt.ts`):
- Creates structured prompts for the LLM with user metrics
- Guides the LLM to generate focused, actionable explanations

## Extensibility

The backend architecture is designed for easy extension. You can add support for other LLM providers by:
1. Creating a new service (e.g., `openAiService.ts`)
2. Implementing the same interface with `available()` and `prompt()` methods
3. Updating the controller to check and use the new service
4. Adding configuration options to `.env`

This allows integration with OpenAI, Anthropic, or any other online LLM service without changing the frontend or core logic.
