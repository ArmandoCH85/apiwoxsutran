import { GPSDevice, SUTRANPayload } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateGPSDevice(device: GPSDevice): ValidationResult {
  const errors: string[] = [];
  
  if (!device.imei || device.imei.length !== 15) {
    errors.push(`Invalid IMEI: ${device.imei}. Must be 15 digits.`);
  }
  
  // Plate validation: allow any length <= 6 (transform will pad)
  // Only reject if empty or exceeds 6 (can't pad what doesn't fit)
  if (!device.plate_number || device.plate_number.length === 0) {
    errors.push(`Invalid plate: ${device.plate_number}. Plate cannot be empty.`);
  } else if (device.plate_number.length > 6) {
    errors.push(`Invalid plate: ${device.plate_number}. Must be at most 6 chars.`);
  }
  
  if (!device.position || 
      typeof device.position.lat !== 'number' || 
      typeof device.position.lng !== 'number' ||
      Number.isNaN(device.position.lat) ||
      Number.isNaN(device.position.lng)) {
    errors.push(`Invalid position for device ${device.id}`);
  }
  
  if (device.position.speed < 0) {
    errors.push(`Invalid speed: ${device.position.speed}. Must be >= 0.`);
  }
  
  return { valid: errors.length === 0, errors };
}
