export function isValidDeviceTimestamp(isoTimestamp: string): { valid: boolean; error?: string } {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const twentyDaysMs = 20 * 24 * 60 * 60 * 1000;
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid timestamp format' };
  }
  
  if (date.getTime() > now.getTime()) {
    return { valid: false, error: 'Device timestamp is in the future' };
  }
  
  if (now.getTime() - date.getTime() > twentyDaysMs) {
    return { valid: false, error: 'Device timestamp is older than 20 days' };
  }
  
  return { valid: true };
}
