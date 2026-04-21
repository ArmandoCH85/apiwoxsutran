import { GPSDevice, SUTRANPayload, TransformResult } from '../types';

export interface GPSWOXClient {
  fetchDevices(): Promise<GPSDevice[]>;
}

export interface SUTRANClient {
  send(payload: SUTRANPayload): Promise<void>;
}

export interface DataTransformer {
  transform(device: GPSDevice): TransformResult;
}

export interface Scheduler {
  start(callback: () => void, intervalMs: number): void;
  stop(): void;
}
