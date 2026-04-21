export interface GPSPosition {
  lat: number;
  lng: number;
  speed: number; // knots
  course: number; // 0-360
  timestamp: string; // ISO8601
}

export interface GPSDevice {
  id: string;
  imei: string;
  plate_number: string;
  position: GPSPosition;
  online: boolean;
  sos?: boolean; // Panic button signal
}

export interface PollingResponse {
  success: boolean;
  devices: GPSDevice[];
  error?: string;
}

export type SUTRANEvent = 'ER' | 'PA' | 'BP';

export interface SUTRANPayload {
  plate: string; // exactly 6 chars
  geo: [number, number]; // [lat, lng]
  direction: number; // 0-360
  event: SUTRANEvent;
  speed: number; // km/h
  time_device: string; // YYYY-MM-DD HH:MM:SS GMT-5
  imei?: string; // 15 digits, optional
}

export interface TransformResult {
  success: boolean;
  payload?: SUTRANPayload;
  error?: string;
  device_id?: string;
}

export interface AppConfig {
  gpswox: {
    url: string;
    api_hash: string;
    polling_interval_ms: number;
  };
  sutran: {
    url: string;
    access_token: string;
    timeout_ms: number;
  };
  app: {
    port: number;
    log_level: string;
  };
}
