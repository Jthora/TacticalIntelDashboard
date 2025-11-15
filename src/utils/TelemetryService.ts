import { log } from './LoggerService';

export interface TelemetryEvent {
  name: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export const logTelemetryEvent = (name: string, data?: Record<string, unknown>): TelemetryEvent => {
  const event: TelemetryEvent = {
    name,
    timestamp: new Date().toISOString()
  };

  if (data) {
    event.data = data;
  }

  log.info('Telemetry', name, data);
  return event;
};
