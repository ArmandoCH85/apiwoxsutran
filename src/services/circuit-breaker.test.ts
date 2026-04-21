import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start in CLOSED state', () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should execute function and return result in CLOSED state', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });
    const fn = jest.fn().mockResolvedValue('success');
    
    const result = await breaker.execute(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should transition to OPEN after failure threshold', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    
    // Fail 3 times to hit threshold
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(fn);
      } catch {}
    }
    
    expect(breaker.getState()).toBe('OPEN');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should reject calls immediately when OPEN', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 1000 });
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    
    // Hit the threshold
    try { await breaker.execute(fn); } catch {}
    try { await breaker.execute(fn); } catch {}
    
    expect(breaker.getState()).toBe('OPEN');
    
    // Next call should be rejected immediately without calling fn
    await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is OPEN');
    expect(fn).toHaveBeenCalledTimes(2); // Not called again
  });

  it('should transition to HALF_OPEN after reset timeout', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 1000 });
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    
    // Hit the threshold
    try { await breaker.execute(fn); } catch {}
    try { await breaker.execute(fn); } catch {}
    expect(breaker.getState()).toBe('OPEN');
    
    // Advance time past reset timeout
    await jest.advanceTimersByTimeAsync(1000);
    
    // Should transition to HALF_OPEN on next call attempt
    const successFn = jest.fn().mockResolvedValue('success');
    const result = await breaker.execute(successFn);
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should reset failure count on success', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });
    
    // Two failures
    const failFn = jest.fn().mockRejectedValue(new Error('fail'));
    try { await breaker.execute(failFn); } catch {}
    try { await breaker.execute(failFn); } catch {}
    expect(breaker.getState()).toBe('CLOSED'); // Not OPEN yet (threshold is 3)
    
    // Two more failures to hit threshold
    try { await breaker.execute(failFn); } catch {}
    expect(breaker.getState()).toBe('OPEN');
    
    // Advance time past reset timeout
    await jest.advanceTimersByTimeAsync(1000);
    
    // Success should reset and close
    const successFn = jest.fn().mockResolvedValue('success');
    const result = await breaker.execute(successFn);
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should allow calls in HALF_OPEN state', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 1000 });
    const failFn = jest.fn().mockRejectedValue(new Error('fail'));
    
    // Hit the threshold
    try { await breaker.execute(failFn); } catch {}
    try { await breaker.execute(failFn); } catch {}
    expect(breaker.getState()).toBe('OPEN');
    
    // Advance time past reset timeout
    await jest.advanceTimersByTimeAsync(1000);
    
    // Execute in HALF_OPEN state - should allow call through
    const successFn = jest.fn().mockResolvedValue('half-open success');
    const result = await breaker.execute(successFn);
    expect(result).toBe('half-open success');
  });
});
