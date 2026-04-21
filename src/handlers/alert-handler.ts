export enum AlertLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface Alert {
  level: AlertLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export class AlertHandler {
  private alerts: Alert[] = [];

  add(level: AlertLevel, message: string, context?: Record<string, unknown>): void {
    const alert: Alert = { level, message, timestamp: new Date(), context };
    this.alerts.push(alert);
    console.log(`[${level}] ${message}`, context || '');

    if (level === AlertLevel.CRITICAL) {
      this.notifyExternal();
    }
  }

  private notifyExternal(): void {
    // Placeholder for external notification (email, Slack, etc.)
    console.log('CRITICAL ALERT: External notification would be sent here');
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}
