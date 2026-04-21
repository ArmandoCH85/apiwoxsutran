import nock from 'nock';
import { GPSWOXClientAdapter } from '../adapters/gpswox-client';

describe('GPSWOXClientAdapter Integration', () => {
  afterEach(() => nock.cleanAll());

  describe('fetchDevices', () => {
    it('should fetch devices successfully', async () => {
      const mockItems = [
        {
          id: 62,
          alarm: 0,
          name: 'AWV168 TISS',
          online: 'ack',
          lat: -12.102681,
          lng: -77.02674,
          speed: 0,
          course: 261,
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

      const client = new GPSWOXClientAdapter('https://drsecuritygps.com', 'test_hash');
      const devices = await client.fetchDevices();

      expect(devices).toHaveLength(1);
      expect(devices[0].id).toBe('62');
      expect(devices[0].imei).toBe('865190071353729');
      expect(devices[0].position.lat).toBe(-12.102681);
      expect(devices[0].position.lng).toBe(-77.02674);
    });

    it('should handle malformed response', async () => {
      nock('https://drsecuritygps.com')
        .get('/get_devices_latest')
        .query({ user_api_hash: 'test_hash' })
        .reply(200, 'not json');

      const client = new GPSWOXClientAdapter('https://drsecuritygps.com', 'test_hash');
      await expect(client.fetchDevices()).rejects.toThrow('GPSWOX fetch failed');
    });

    it('should handle missing items array', async () => {
      nock('https://drsecuritygps.com')
        .get('/get_devices_latest')
        .query({ user_api_hash: 'test_hash' })
        .reply(200, { data: 'something' });

      const client = new GPSWOXClientAdapter('https://drsecuritygps.com', 'test_hash');
      await expect(client.fetchDevices()).rejects.toThrow('GPSWOX response missing items array');
    });

    it('should handle empty items array', async () => {
      nock('https://drsecuritygps.com')
        .get('/get_devices_latest')
        .query({ user_api_hash: 'test_hash' })
        .reply(200, { items: [], events: [], time: 1776732413, version: '3.7.7' });

      const client = new GPSWOXClientAdapter('https://drsecuritygps.com', 'test_hash');
      const devices = await client.fetchDevices();
      expect(devices).toHaveLength(0);
    });

    it('should handle 401 authentication failure', async () => {
      nock('https://drsecuritygps.com')
        .get('/get_devices_latest')
        .query({ user_api_hash: 'invalid_hash' })
        .reply(401, { error: 'Unauthorized' });

      const client = new GPSWOXClientAdapter('https://drsecuritygps.com', 'invalid_hash');
      await expect(client.fetchDevices()).rejects.toThrow('GPSWOX fetch failed');
    });
  });
});