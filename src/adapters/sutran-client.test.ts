import { SUTRANClientAdapter } from './sutran-client';
import { SUTRANPayload } from '../types';

const mockPost = jest.fn();
const mockCreate = jest.fn().mockReturnValue({
  post: mockPost,
  defaults: { timeout: 5000 }
});

jest.mock('axios', () => ({
  create: (...args: any[]) => mockCreate(...args)
}));

describe('SUTRANClientAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockReturnValue({
      post: mockPost,
      defaults: { timeout: 5000 }
    });
  });

  describe('send', () => {
    it('should send payload to /positions endpoint with access-token header', async () => {
      mockPost.mockResolvedValue({ status: 200 });

      const client = new SUTRANClientAdapter('https://sutran.example.com', 'test-token', 5000);
      const payload: SUTRANPayload = {
        plate: 'ABC123',
        geo: [-12.046374, -77.042793],
        direction: 180,
        event: 'ER',
        speed: 84,
        time_device: '2026-04-20 09:30:00',
        imei: '123456789012345'
      };

      await client.send(payload);

      expect(mockPost).toHaveBeenCalledWith(
        '/positions',
        payload,
        {
          headers: {
            'access-token': 'test-token'
          }
        }
      );
    });

    it('should throw error when SUTRAN API fails', async () => {
      mockPost.mockRejectedValue(new Error('Network error'));

      const client = new SUTRANClientAdapter('https://sutran.example.com', 'test-token', 5000);
      const payload: SUTRANPayload = {
        plate: 'ABC123',
        geo: [-12.046374, -77.042793],
        direction: 180,
        event: 'ER',
        speed: 84,
        time_device: '2026-04-20 09:30:00'
      };

      await expect(client.send(payload)).rejects.toThrow('SUTRAN send failed: Network error');
    });

    it('should set correct base URL and timeout', async () => {
      mockPost.mockResolvedValue({ status: 200 });

      new SUTRANClientAdapter('https://sutran.example.com', 'token', 3000);

      expect(mockCreate).toHaveBeenCalledWith({
        baseURL: 'https://sutran.example.com',
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });
  });
});
