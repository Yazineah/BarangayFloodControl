export type AlertTier = 'normal' | 'watch' | 'warning' | 'emergency';

export interface SensorData {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  waterLevel: number; // cm
  maxLevel: number; // cm
  temperature: number; // °C
  humidity: number; // %
  rainfall: number; // mm/hr
  battery: number; // %
  signal: number; // dBm
  lastUpdated: Date;
  status: 'online' | 'offline' | 'maintenance';
  tier: AlertTier;
}

export interface AlertEvent {
  id: string;
  sensorId: string;
  sensorName: string;
  tier: AlertTier;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  waterLevel: number;
}

export interface HistoricalData {
  timestamp: Date;
  waterLevel: number;
  rainfall: number;
  temperature: number;
}

export interface SystemStats {
  totalSensors: number;
  onlineSensors: number;
  activeAlerts: number;
  avgWaterLevel: number;
  maxWaterLevel: number;
  systemUptime: number;
}
