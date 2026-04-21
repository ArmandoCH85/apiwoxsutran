import { loadConfig } from './config';
import { GPSWOXClientAdapter } from './adapters/gpswox-client';
import { SUTRANClientAdapter } from './adapters/sutran-client';
import { IntervalScheduler } from './services/scheduler';
import { PollingService } from './services/polling-service';
import { AlertHandler, AlertLevel } from './handlers/alert-handler';

async function main() {
  const config = loadConfig();
  const alertHandler = new AlertHandler();

  console.log(`Starting GPSWOX→SUTRAN retransmission service`);
  console.log(`Polling interval: ${config.gpswox.polling_interval_ms}ms`);

  const gpswoxClient = new GPSWOXClientAdapter(
    config.gpswox.url,
    config.gpswox.api_hash
  );

  const sutranClient = new SUTRANClientAdapter(
    config.sutran.url,
    config.sutran.access_token,
    config.sutran.timeout_ms
  );

  const scheduler = new IntervalScheduler();
  const pollingService = new PollingService(gpswoxClient, sutranClient);

  const runPoll = async () => {
    try {
      console.log(`[${new Date().toISOString()}] Polling GPSWOX...`);
      const result = await pollingService.pollAndTransmit();
      console.log(`[${new Date().toISOString()}] Poll complete: ${result.succeeded}/${result.processed} succeeded`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown';
      console.error(`Poll error: ${message}`);
      if (message.includes('authentication failed') || message.includes('401')) {
        alertHandler.add(AlertLevel.CRITICAL, `Auth failure detected: ${message}`);
      }
    }
  };

  scheduler.start(runPoll, config.gpswox.polling_interval_ms);

  console.log(`Service started. Press Ctrl+C to stop.`);
}

main().catch(err => {
  console.error(`Fatal error: ${err}`);
  process.exit(1);
});
