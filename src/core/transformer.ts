import { GPSDevice, SUTRANPayload, SUTRANEvent, TransformResult } from '../types';
import { validateGPSDevice } from './validator';
import { isValidDeviceTimestamp } from './date-validator';

const KNOTS_TO_KMH = 1.852;

function formatTimeForSUTRAN(isoTimestamp: string): string {
  const gmt5 = new Date(new Date(isoTimestamp).getTime() - 5 * 60 * 60 * 1000);

  const year = gmt5.getUTCFullYear();
  const month = String(gmt5.getUTCMonth() + 1).padStart(2, '0');
  const day = String(gmt5.getUTCDate()).padStart(2, '0');
  const hours = String(gmt5.getUTCHours()).padStart(2, '0');
  const minutes = String(gmt5.getUTCMinutes()).padStart(2, '0');
  const seconds = String(gmt5.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
      imei: device.imei ? Number(device.imei) : undefined
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
