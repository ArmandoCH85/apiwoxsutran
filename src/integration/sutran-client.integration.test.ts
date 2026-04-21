import nock from 'nock';
import { SUTRANClientAdapter } from '../adapters/sutran-client';
import { SUTRANPayload } from '../types';

describe('SUTRANClientAdapter Integration', () => {
  afterEach(() => nock.cleanAll());

  describe('send', () => {
    it('should send payload successfully', async () => {
      const payload: SUTRANPayload = {
        plate: 'ABC123',
        geo: [-12.0464, -77.0428],
        direction: 90,
        event: 'ER',
        speed: 19,
        time_device: '2024-01-15 05:30:00',
        imei: '123456789012345'
      };

      nock('https://api.sutran.gob.pe/v2')
        .post('/positions')
        .reply(200, { success: true });

      const client = new SUTRANClientAdapter('https://api.sutran.gob.pe/v2', 'test_token', 5000);
      await expect(client.send(payload)).resolves.not.toThrow();
    });

    it('should send with correct access-token header', async () => {
      const payload: SUTRANPayload = {
        plate: 'ABC123',
        geo: [-12.0464, -77.0428],
        direction: 90,
        event: 'ER',
        speed: 19,
        time_device: '2024-01-15 05:30:00'
      };

      nock('https://api.sutran.gob.pe/v2', {
        reqheaders: { 'access-token': 'test_token' }
      })
        .post('/positions')
        .reply(200, { success: true });

      const client = new SUTRANClientAdapter('https://api.sutran.gob.pe/v2', 'test_token', 5000);
      await client.send(payload);
    });

    it('should handle 401 token expiry', async () => {
      const payload: SUTRANPayload = {
        plate: 'ABC123',
        geo: [-12.0464, -77.0428],
        direction: 90,
        event: 'ER',
        speed: 19,
        time_device: '2024-01-15 05:30:00'
      };

      nock('https://api.sutran.gob.pe/v2')
        .post('/positions')
        .reply(401, { error: 'Token expired' });

      const client = new SUTRANClientAdapter('https://api.sutran.gob.pe/v2', 'expired_token', 5000);
      await expect(client.send(payload)).rejects.toThrow('SUTRAN token expired or invalid');
    });

    it('should handle server error', async () => {
      const payload: SUTRANPayload = {
        plate: 'ABC123',
        geo: [-12.0464, -77.0428],
        direction: 90,
        event: 'ER',
        speed: 19,
        time_device: '2024-01-15 05:30:00'
      };

      nock('https://api.sutran.gob.pe/v2')
        .post('/positions')
        .reply(500, { error: 'Internal server error' });

      const client = new SUTRANClientAdapter('https://api.sutran.gob.pe/v2', 'test_token', 5000);
      await expect(client.send(payload)).rejects.toThrow();
    });

    it('should timeout after configured time', async () => {
      const payload: SUTRANPayload = {
        plate: 'ABC123',
        geo: [-12.0464, -77.0428],
        direction: 90,
        event: 'ER',
        speed: 19,
        time_device: '2024-01-15 05:30:00'
      };

      nock('https://api.sutran.gob.pe/v2')
        .post('/positions')
        .delay(6000)
        .reply(200);

      const client = new SUTRANClientAdapter('https://api.sutran.gob.pe/v2', 'test_token', 5000);
      await expect(client.send(payload)).rejects.toThrow();
    });
  });
});
