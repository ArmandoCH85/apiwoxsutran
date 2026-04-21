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
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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

      const contentType = String(response.headers['content-type'] || '');
      if (contentType.includes('text/html')) {
        throw new Error('SUTRAN returned HTML instead of JSON. Check URL endpoint.');
      }

      console.log(`[SUTRAN RESPONSE] plate=${payload.plate} body=${JSON.stringify(response.data)}`);

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
