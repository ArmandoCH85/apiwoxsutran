import { GPSDevice, SUTRANPayload, SUTRANEvent, TransformResult } from '../types';
import { validateGPSDevice } from './validator';
import { isValidDeviceTimestamp } from './date-validator';

const KNOTS_TO_KMH = 1.852;
const SUTRAN_DATE_FORMAT = 'YYYY-MM-DD HH:MM:SS';

function formatTimeForSUTRAN(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);

  // Get UTC components and subtract 5 hours for GMT-5
  let hours = date.getUTCHours() - 5;
  if (hours < 0) hours += 24;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
}

function determineEvent(speedKmh: number, hasPanicSignal?: boolean): SUTRANEvent {
  if (hasPanicSignal) return 'BP';
  if (speedKmh > 0) return 'ER';
  return 'PA';
}

function padPlate(plate: string): string {
  return plate.padEnd(6, ' ').substring(0, 6);
}

export function transform(device: GPSDevice): TransformResult {
  const validation = validateGPSDevice(device);
  if (!validation.valid) {
    return {
      success: false,
      error: `Validation failed: ${validation.errors.join(', ')}`,
      device_id: device.id
    };
  }

  const timestampValidation = isValidDeviceTimestamp(device.position.timestamp);
  if (!timestampValidation.valid) {
    return {
      success: false,
      error: `Timestamp validation failed: ${timestampValidation.error}`,
      device_id: device.id
    };
  }

  try {
    const speedKmh = device.position.speed * KNOTS_TO_KMH;
    const event = determineEvent(speedKmh, device.sos);
    
    const payload: SUTRANPayload = {
      plate: padPlate(device.plate_number),
      geo: [device.position.lat, device.position.lng],
      direction: Math.round(device.position.course) % 360,
      event,
      speed: Math.round(speedKmh),
      time_device: formatTimeForSUTRAN(device.position.timestamp),
      imei: device.imei
    };
    
    return {
      success: true,
      payload,
      device_id: device.id
    };
  } catch (err) {
    return {
      success: false,
      error: `Transform error: ${err instanceof Error ? err.message : 'Unknown'}`,
      device_id: device.id
    };
  }
}
