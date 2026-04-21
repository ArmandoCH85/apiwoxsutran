import nock from 'nock';
import { IntervalScheduler } from '../services/scheduler';
import { PollingService } from '../services/polling-service';
import { GPSWOXClientAdapter } from '../adapters/gpswox-client';
import { SUTRANClientAdapter } from '../adapters/sutran-client';

const scheduler = new IntervalScheduler();

describe('End-to-End Integration', () => {
  afterEach(() => {
    scheduler.stop();
    nock.cleanAll();
  });

  it('should complete full poll-transform-transmit cycle', async () => {
    const mockItems = [
      {
        id: 62,
        alarm: 0,
        name: 'AWV168 TISS',
        online: 'ack',
        lat: -12.102681,
        lng: -77.02674,
        speed: 5,
        course: 90,
        time: '20-04-2026 19:46:50',
        device_data: {
          imei: '865190071353729',
          plate_number: 'ABC123'
        }
      }
    ];

    nock('https://drsecuritygps.com')
      .get('/get_devices_latest')
      .query({ user_api_hash: 'test_hash' })
      .reply(200, { items: mockItems, events: [], time: 1776732413, version: '3.7.7' });

    nock('https://api.sutran.gob.pe/v2')
      .post('/positions')
      .reply(200);

    const gpswoxClient = new GPSWOXClientAdapter('https://drsecuritygps.com', 'test_hash');
    const sutranClient = new SUTRANClientAdapter('https://api.sutran.gob.pe/v2', 'test_token', 5000);
    const pollingService = new PollingService(gpswoxClient, sutranClient);

    const result = await pollingService.pollAndTransmit();

    expect(result.processed).toBe(1);
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(0);
  });

  it('should handle GPSWOX returning empty device list', async () => {
    nock('https://drsecuritygps.com')
      .get('/get_devices_latest')
      .query({ user_api_hash: 'test_hash' })
      .reply(200, { items: [], events: [], time: 1776732413, version: '3.7.7' });

    const gpswoxClient = new GPSWOXClientAdapter('https://drsecuritygps.com', 'test_hash');
    const sutranClient = new SUTRANClientAdapter('https://api.sutran.gob.pe/v2', 'test_token', 5000);
    const pollingService = new PollingService(gpswoxClient, sutranClient);

    const result = await pollingService.pollAndTransmit();

    expect(result.processed).toBe(0);
    expect(result.succeeded).toBe(0);
    expect(result.failed).toBe(0);
  });
});