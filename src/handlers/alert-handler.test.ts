import { AlertHandler, AlertLevel } from './alert-handler';

describe('AlertHandler', () => {
  let alertHandler: AlertHandler;

  beforeEach(() => {
    alertHandler = new AlertHandler();
  });

  describe('add', () => {
    it('should add an alert with INFO level', () => {
      alertHandler.add(AlertLevel.INFO, 'Test info message');

      const alerts = alertHandler.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].level).toBe(AlertLevel.INFO);
      expect(alerts[0].message).toBe('Test info message');
      expect(alerts[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add an alert with WARNING level', () => {
      alertHandler.add(AlertLevel.WARNING, 'Test warning message');

      const alerts = alertHandler.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].level).toBe(AlertLevel.WARNING);
    });

    it('should add an alert with CRITICAL level', () => {
      alertHandler.add(AlertLevel.CRITICAL, 'Test critical message');

      const alerts = alertHandler.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].level).toBe(AlertLevel.CRITICAL);
    });

    it('should add an alert with context', () => {
      const context = { deviceId: '123', error: 'Auth failed' };
      alertHandler.add(AlertLevel.WARNING, 'Test message', context);

      const alerts = alertHandler.getAlerts();
      expect(alerts[0].context).toEqual(context);
    });
  });

  describe('getAlerts', () => {
    it('should return a copy of the alerts array', () => {
      alertHandler.add(AlertLevel.INFO, 'Message 1');
      alertHandler.add(AlertLevel.INFO, 'Message 2');

      const alerts = alertHandler.getAlerts();
      alerts.push({} as never);

      const currentAlerts = alertHandler.getAlerts();
      expect(currentAlerts).toHaveLength(2);
    });
  });

  describe('clearAlerts', () => {
    it('should clear all alerts', () => {
      alertHandler.add(AlertLevel.INFO, 'Message 1');
      alertHandler.add(AlertLevel.INFO, 'Message 2');

      alertHandler.clearAlerts();

      expect(alertHandler.getAlerts()).toHaveLength(0);
    });
  });
});
