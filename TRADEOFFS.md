# Design Tradeoffs

This document explains the key design tradeoffs made during the development of this project.

## Data Storage: In-Memory SQLite

### Decision

The application imports CSV data into an in-memory SQLite database instead of querying the CSV file directly.

### Rationale

There are no suitable CSV parsers for Node.js that allow efficient querying over datasets. CSV files are designed for sequential reading, not for the kind of aggregation and filtering queries needed for user metrics computation. By importing the data into SQLite, we gain:

- SQL query capabilities for complex aggregations
- Indexed lookups for fast user-specific queries
- Native support for GROUP BY operations
- Better performance for repeated queries

### Tradeoff

**Limitation**: The in-memory approach is limited by available system memory. For large datasets (gigabytes of event data), the application may run out of memory.

**Future Improvement**: For production use with large datasets, the project should:
1. Maintain a persistent SQL database (PostgreSQL, MySQL) or NoSQL database (MongoDB, DynamoDB)
2. Provide a separate import utility to load CSV data into the database
3. Support incremental data loading rather than full reloads on startup
4. Implement pagination and streaming for large result sets

This would allow the system to scale to datasets of any size without memory constraints.

## AI Model: Local LLM vs Cloud Services

### Decision

The application uses a local LLM (via `node-llama-cpp`) with fallback to a rule-based pseudo-AI service, rather than cloud-based AI services like OpenAI or Anthropic.

### Rationale

- **Cost**: To minimize costs and avoid spending money during project evaluation, local LLM inference is free after the initial model download
- **Privacy**: User data stays on the local machine without being sent to third-party services
- **Offline capability**: The application can generate explanations without internet connectivity
- **Demonstration purposes**: Both local LLM and rule-based approaches produce adequate explanations for showcasing the feature

### Tradeoff

**Limitation**: Local LLM inference depends on the computational power of the host computer and may be slow, especially on:
- Machines without GPU acceleration
- Older CPUs with limited cores
- Systems with insufficient RAM for model loading

The quality of explanations may also be lower compared to state-of-the-art cloud models like GPT-4 or Claude.

**Future Improvement**: For production use, consider:
1. Adding support for cloud-based LLM services (OpenAI, Anthropic, etc.) as a configuration option
2. Implementing a hybrid approach: use cloud services when available, fall back to local models when offline
3. Providing model selection options based on available hardware (smaller models for resource-constrained environments)
4. Caching explanations to avoid regenerating them for the same user metrics
5. Implementing request queuing and rate limiting for cloud API calls to manage costs

The architecture is already designed for extensibility (see [AI_EXPLANATION.md](AI_EXPLANATION.md)), making it straightforward to add cloud LLM support without changing the frontend or core logic.
