import { withRetry } from './retry';
import { CircuitBreaker } from './circuit-breaker';
import { GPSDevice } from '../types';
import { transform } from '../core/transformer';

export class PollingService {
  private sutranBreaker: CircuitBreaker;
  private sutranAuthFailures = 0;

  constructor(
    private gpswoxClient: { fetchDevices(): Promise<GPSDevice[]> },
    private sutranClient: { send(payload: unknown): Promise<void> }
  ) {
    this.sutranBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeoutMs: 60000
    });
  }

  async pollAndTransmit(): Promise<{ processed: number; succeeded: number; failed: number }> {
    const devices = await this.gpswoxClient.fetchDevices();

    if (devices.length === 0) {
      console.log('No devices to process');
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    let succeeded = 0;
    let failed = 0;

    for (const device of devices) {
      const result = transform(device);

      if (result.success && result.payload) {
        try {
          await this.sutranBreaker.execute(() =>
            withRetry(() => this.sutranClient.send(result.payload), {
              maxAttempts: 3,
              baseDelayMs: 1000,
              maxDelayMs: 30000
            })
          );
          console.log(`[TRANSMITTED] plate=${result.payload.plate} imei=${result.payload.imei} event=${result.payload.event} speed=${result.payload.speed} km/h lat=${result.payload.geo[0]} lng=${result.payload.geo[1]}`);
          succeeded++;
        } catch (err) {
          if (err instanceof Error && (err.message.includes('401') || err.message.includes('authentication failed'))) {
            this.sutranAuthFailures++;
            console.error(`SUTRAN auth failure (device ${device.id}): ${err.message}`);
            if (this.sutranAuthFailures >= 3) {
              console.error('ALERT: 3 consecutive SUTRAN auth failures detected');
            }
            failed++;
            continue;
          }
          console.error(`Failed to send to SUTRAN (device ${device.id}): ${err instanceof Error ? err.message : 'Unknown'}`);
          failed++;
        }
      } else {
        console.warn(`Transform failed for device ${device.id}: ${result.error}`);
        failed++;
      }
    }

    return { processed: devices.length, succeeded, failed };
  }
}
