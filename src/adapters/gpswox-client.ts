import axios, { AxiosInstance } from 'axios';
import { GPSDevice } from '../types';
import { GPSWOXClient } from '../ports';

export class GPSWOXClientAdapter implements GPSWOXClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiHash: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      params: { user_api_hash: apiHash },
      timeout: 10000
    });
  }

  async fetchDevices(): Promise<GPSDevice[]> {
    try {
      const response = await this.client.get('/get_devices');
      const data = response.data;

      if (!data || !Array.isArray(data)) {
        throw new Error('GPSWOX response missing items array');
      }

      const devices: GPSDevice[] = [];

      for (const group of data) {
        if (!group.items || !Array.isArray(group.items)) continue;

        for (const item of group.items) {
          const deviceData = (item.device_data || {}) as Record<string, unknown>;
          const timeStr = String(item.time || '');

          let timestamp = new Date().toISOString();
          if (timeStr) {
            const parts = timeStr.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
            if (parts) {
              const [, day, month, year, hour, min, sec] = parts;
              timestamp = `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
            }
          }

          const plateNum = String(deviceData.plate_number || item.name || '').substring(0, 6).trim();

          devices.push({
            id: String(item.id || ''),
            imei: String(deviceData.imei || ''),
            plate_number: plateNum,
            online: item.online === 'ack',
            sos: item.alarm === 1,
            position: {
              lat: Number(item.lat || 0),
              lng: Number(item.lng || 0),
              speed: Number(item.speed || 0),
              course: Number(item.course || 0),
              timestamp
            }
          });
        }
      }

      return devices;
    } catch (err) {
      throw new Error(`GPSWOX fetch failed: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }
}
