import axios, { AxiosInstance } from 'axios';
import { SUTRANPayload } from '../types';
import { SUTRANClient } from '../ports';

export class SUTRANClientAdapter implements SUTRANClient {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(baseUrl: string, accessToken: string, timeoutMs: number) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async send(payload: SUTRANPayload): Promise<void> {
    try {
      const response = await this.client.post('/transmisiones', payload, {
        headers: {
          'access-token': this.accessToken
        }
      });

      console.log(`[SUTRAN RESPONSE] plate=${payload.plate} code=${response.status} crc=${response.data?.crc} result=${response.data?.result}`);

      if (response.status === 401) {
        throw new Error('SUTRAN token expired or invalid. Stopping transmissions.');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        throw new Error('SUTRAN token expired or invalid. Stopping transmissions.');
      }
      throw new Error(`SUTRAN send failed: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }
}
