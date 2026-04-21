export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, public provider: 'GPSWOX' | 'SUTRAN') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export function handleError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }
  
  if (err instanceof Error) {
    if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
      return new NetworkError(err.message);
    }
    return new AppError(err.message, 'UNKNOWN_ERROR');
  }
  
  return new AppError('Unknown error', 'UNKNOWN_ERROR');
}
