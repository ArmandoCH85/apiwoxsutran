# GPSWOX to SUTRAN Retransmission Service

GPS tracking data retransmission service that polls GPSWOX API and forwards data to SUTRAN API.

## Requirements
- Node.js 20+
- GPSWOX API access
- SUTRAN API credentials

## Setup

1. Copy `config.yaml.example` to `config.yaml`
2. Fill in your API credentials:
   - `GPSWOX_API_HASH` - Your GPSWOX user API hash
   - `SUTRAN_ACCESS_TOKEN` - Your SUTRAN access token

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build:
   ```bash
   npm run build
   ```

5. Run:
   ```bash
   npm start
   ```

## Development

```bash
npm run dev  # Run with ts-node
npm test     # Run tests
npm run test:coverage  # Run with coverage
```

## Architecture

- `src/core/` - Business logic (transformer, validator)
- `src/adapters/` - External API clients (GPSWOX, SUTRAN)
- `src/services/` - Infrastructure (scheduler, retry, circuit breaker)
- `src/handlers/` - Error and alert handling
- `src/ports/` - Interface definitions

## Data Flow

1. Scheduler triggers poll every N seconds
2. GPSWOX client fetches device list
3. Transformer converts GPSWOX format to SUTRAN format
4. SUTRAN client sends data to SUTRAN
5. Errors handled with retry and circuit breaker

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| GPSWOX_API_HASH | GPSWOX API authentication | - |
| SUTRAN_ACCESS_TOKEN | SUTRAN API token | - |
| GPSWOX_POLLING_INTERVAL_MS | Poll frequency in ms | 30000 |
