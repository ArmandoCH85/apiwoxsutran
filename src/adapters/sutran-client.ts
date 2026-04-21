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

      const data = response.data;
      const code = data?.code;
      const result = data?.result;
      const crc = data?.crc;
      const errors = data?.error;

      if (code >= 2000 && code < 3000 && result === 'OK') {
        console.log(`[SUTRAN OK] plate=${payload.plate} crc=${crc} code=${code} result=${result}`);
      } else if (code === 5002) {
        console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=Se requiere header access-token`);
      } else if (code === 5003) {
        console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=access-token invalid`);
      } else if (code === 4001) {
        console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=Cadena JSON Invalida`);
      } else if (code === 4002) {
        console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=Cadena JSON no cumple caracteristicas errors=${JSON.stringify(errors)}`);
      } else if (code === 4003) {
        console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=Fecha del reporte en el pasado (mayor a 20 dias)`);
      } else if (code === 4004) {
        console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=Fecha del reporte en el futuro`);
      } else if (code === 5001) {
        console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=Solo admite metodos POST`);
      } else {
        console.log(`[SUTRAN RESPONSE] plate=${payload.plate} body=${JSON.stringify(data)}`);
      }

      if (code && !(code >= 2000 && code < 3000)) {
        throw new Error(`SUTRAN rejected: code=${code} result=${result}`);
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response: { status: number; data: Record<string, unknown> } };
        const body = axiosErr.response.data;
        const code = body?.code;
        const result = body?.result;
        const errors = body?.error;

        if (code === 4002) {
          console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=${result} errors=${JSON.stringify(errors)}`);
          throw new Error(`SUTRAN rejected: code=${code} result=${result}`);
        }
        if (code === 5003) {
          console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=access-token invalid`);
          throw new Error('SUTRAN token expired or invalid. Stopping transmissions.');
        }
        if (code) {
          console.error(`[SUTRAN ERROR] plate=${payload.plate} code=${code} result=${result}`);
          throw new Error(`SUTRAN rejected: code=${code} result=${result}`);
        }

        if (axiosErr.response.status === 401) {
          throw new Error('SUTRAN token expired or invalid. Stopping transmissions.');
        }
        console.error(`[SUTRAN HTTP ERROR] status=${axiosErr.response.status} body=${JSON.stringify(body)}`);
      }
      throw new Error(`SUTRAN send failed: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }
}
