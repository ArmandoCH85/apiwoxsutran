import { validateGPSDevice } from './validator';
import { GPSDevice } from '../types';

describe('validateGPSDevice', () => {
  const validDevice: GPSDevice = {
    id: '1',
    imei: '123456789012345',
    plate_number: 'ABCDEF',
    online: true,
    position: {
      lat: -12.046374,
      lng: -77.042793,
      speed: 10.5,
      course: 180,
      timestamp: '2026-04-20T14:30:00Z'
    }
  };

  it('should return valid for a correct device', () => {
    const result = validateGPSDevice(validDevice);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject IMEI that is not 15 digits', () => {
    const device: GPSDevice = {
      ...validDevice,
      imei: '12345678901234' // 14 digits
    };
    const result = validateGPSDevice(device);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('IMEI'))).toBe(true);
  });

  it('should reject empty IMEI', () => {
    const device: GPSDevice = { ...validDevice, imei: '' };
    const result = validateGPSDevice(device);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('IMEI'))).toBe(true);
  });

  it('should accept plate shorter than 6 chars (transform will pad)', () => {
    const device: GPSDevice = { ...validDevice, plate_number: 'ABC' };
    const result = validateGPSDevice(device);
    expect(result.valid).toBe(true);
  });

  it('should accept plate with exactly 6 chars', () => {
    const device: GPSDevice = { ...validDevice, plate_number: 'ABCDEF' };
    const result = validateGPSDevice(device);
    expect(result.valid).toBe(true);
  });

  it('should reject plate longer than 6 chars', () => {
    const device: GPSDevice = { ...validDevice, plate_number: '1234567' };
    const result = validateGPSDevice(device);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('plate'))).toBe(true);
  });

  it('should reject empty plate', () => {
    const device: GPSDevice = { ...validDevice, plate_number: '' };
    const result = validateGPSDevice(device);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('plate'))).toBe(true);
  });

  it('should reject invalid position lat', () => {
    const device: GPSDevice = {
      ...validDevice,
      position: { ...validDevice.position, lat: NaN }
    };
    const result = validateGPSDevice(device);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('position'))).toBe(true);
  });

  it('should reject negative speed', () => {
    const device: GPSDevice = {
      ...validDevice,
      position: { ...validDevice.position, speed: -1 }
    };
    const result = validateGPSDevice(device);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('speed'))).toBe(true);
  });

  it('should accept speed of 0', () => {
    const device: GPSDevice = {
      ...validDevice,
      position: { ...validDevice.position, speed: 0 }
    };
    const result = validateGPSDevice(device);
    expect(result.valid).toBe(true);
  });
});
