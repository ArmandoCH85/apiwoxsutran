import { isValidDeviceTimestamp } from './date-validator';

describe('date-validator', () => {
  describe('isValidDeviceTimestamp', () => {
    it('should accept a valid timestamp from today', () => {
      const now = new Date().toISOString();
      const result = isValidDeviceTimestamp(now);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept a timestamp from 10 days ago', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const result = isValidDeviceTimestamp(tenDaysAgo);
      expect(result.valid).toBe(true);
    });

    it('should reject a timestamp more than 20 days in the past', () => {
      const twentyOneDaysAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();
      const result = isValidDeviceTimestamp(twentyOneDaysAgo);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Device timestamp is older than 20 days');
    });

    it('should reject a timestamp in the future', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const result = isValidDeviceTimestamp(tomorrow);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Device timestamp is in the future');
    });

    it('should reject an invalid timestamp format', () => {
      const result = isValidDeviceTimestamp('not-a-date');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid timestamp format');
    });

    it('should reject empty string', () => {
      const result = isValidDeviceTimestamp('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid timestamp format');
    });
  });
});
