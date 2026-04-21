import { transform } from './transformer';
import { GPSDevice } from '../types';

describe('transformer', () => {
  const validDevice: GPSDevice = {
    id: '1',
    imei: '123456789012345',
    plate_number: 'ABCDEF',
    online: true,
    position: {
      lat: -12.046374,
      lng: -77.042793,
      speed: 45.5, // knots
      course: 180,
      timestamp: '2026-04-20T14:30:00Z'
    }
  };

  describe('padPlate', () => {
    // Note: transform() validates first, so plates > 6 fail validation
    // We test truncation by checking padPlate handles edge cases correctly
    // when invoked (for valid plates that are exactly 6 or shorter)
    
    it('should pad 3-char plate to 6 chars (right pad with spaces)', () => {
      const device: GPSDevice = { ...validDevice, plate_number: 'ABC' };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.plate).toBe('ABC   ');
    });

    it('should not modify 6-char plate', () => {
      const device: GPSDevice = { ...validDevice, plate_number: 'ABCDEF' };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.plate).toBe('ABCDEF');
    });

    it('should reject plate longer than 6 chars (validation fails)', () => {
      const device: GPSDevice = { ...validDevice, plate_number: 'ABCDEFGH' };
      const result = transform(device);
      expect(result.success).toBe(false);
      expect(result.error).toContain('plate');
    });
  });

  describe('transform speed', () => {
    it('should convert 45.5 knots to 84 km/h (45.5 * 1.852 = 84.266)', () => {
      const device: GPSDevice = { ...validDevice, position: { ...validDevice.position, speed: 45.5 } };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.speed).toBe(84);
    });

    it('should convert 0 knots to 0 km/h', () => {
      const device: GPSDevice = { ...validDevice, position: { ...validDevice.position, speed: 0 } };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.speed).toBe(0);
    });

    it('should round speed to integer', () => {
      const device: GPSDevice = { ...validDevice, position: { ...validDevice.position, speed: 10.3 } };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.speed).toBe(Math.round(10.3 * 1.852));
    });
  });

  describe('event determination', () => {
    it('should return ER when speed > 0', () => {
      const device: GPSDevice = { ...validDevice, position: { ...validDevice.position, speed: 10 } };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.event).toBe('ER');
    });

    it('should return PA when speed = 0', () => {
      const device: GPSDevice = { ...validDevice, position: { ...validDevice.position, speed: 0 } };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.event).toBe('PA');
    });

    it('should return BP when device.sos is true', () => {
      const device: GPSDevice = { 
        ...validDevice, 
        sos: true,
        position: { ...validDevice.position, speed: 0 } 
      };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.event).toBe('BP');
    });
  });

  describe('timestamp conversion', () => {
    it('should convert UTC timestamp to GMT-5', () => {
      const device: GPSDevice = {
        ...validDevice,
        position: { ...validDevice.position, timestamp: '2026-04-20T14:30:00Z' }
      };
      const result = transform(device);
      expect(result.success).toBe(true);
      // GMT-5 is UTC-5: 14:30 UTC → 09:30 GMT-5
      expect(result.payload?.time_device).toBe('2026-04-20 09:30:00');
    });
  });

  describe('direction/course', () => {
    it('should round course to direction', () => {
      const device: GPSDevice = { ...validDevice, position: { ...validDevice.position, course: 179.6 } };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.direction).toBe(180);
    });

    it('should wrap course to 0-360 range', () => {
      const device: GPSDevice = { ...validDevice, position: { ...validDevice.position, course: 361 } };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.direction).toBe(1);
    });
  });

  describe('geo array', () => {
    it('should format lat/lng as [lat, lng] array', () => {
      const device: GPSDevice = {
        ...validDevice,
        position: { ...validDevice.position, lat: -12.046374, lng: -77.042793 }
      };
      const result = transform(device);
      expect(result.success).toBe(true);
      expect(result.payload?.geo).toEqual([-12.046374, -77.042793]);
    });
  });

  describe('validation failure', () => {
    it('should return error for invalid IMEI', () => {
      const device: GPSDevice = { ...validDevice, imei: 'invalid' };
      const result = transform(device);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });
  });
});
