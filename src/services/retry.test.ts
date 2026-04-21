import { withRetry } from './retry';

describe('withRetry', () => {
  it('should return result on first attempt when function succeeds', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('success');
    
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 100 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  }, 10000);

  it('should throw after max attempts exceeded', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));
    
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 100 })
    ).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  }, 10000);

  it('should use exponential backoff', async () => {
    jest.useFakeTimers();
    
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValueOnce('success');
    
    const delayMs = 100;
    const resultPromise = withRetry(fn, { maxAttempts: 2, baseDelayMs: delayMs, maxDelayMs: 1000 });
    
    // Should wait baseDelayMs * 2^0 = 100ms before first retry
    await jest.advanceTimersByTimeAsync(delayMs - 1);
    expect(fn).toHaveBeenCalledTimes(1);
    
    await jest.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(2);
    
    const result = await resultPromise;
    expect(result).toBe('success');
    
    jest.useRealTimers();
  });

  it('should not exceed maxDelayMs', async () => {
    jest.useFakeTimers();
    
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValueOnce('success');
    
    const maxDelay = 50;
    const resultPromise = withRetry(fn, { maxAttempts: 2, baseDelayMs: 1000, maxDelayMs: maxDelay });
    
    // Should not wait more than maxDelay
    await jest.advanceTimersByTimeAsync(maxDelay);
    
    const result = await resultPromise;
    expect(result).toBe('success');
    
    jest.useRealTimers();
  });

  it('should preserve error instance when available', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('test error'));
    
    await expect(
      withRetry(fn, { maxAttempts: 1, baseDelayMs: 1, maxDelayMs: 1 })
    ).rejects.toThrow('test error');
  });

  it('should convert non-Error to Error instance', async () => {
    const fn = jest.fn().mockRejectedValue('string error');
    
    await expect(
      withRetry(fn, { maxAttempts: 1, baseDelayMs: 1, maxDelayMs: 1 })
    ).rejects.toThrow('string error');
  });
});
