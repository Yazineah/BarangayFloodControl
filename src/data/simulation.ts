import { SensorData, AlertEvent, AlertTier, HistoricalData } from '../types';

const SENSOR_LOCATIONS = [
  { id: 'sensor-001', name: 'River North Bridge', location: 'North District', lat: 28.6139, lng: 77.2090 },
  { id: 'sensor-002', name: 'Canal East Gate', location: 'East District', lat: 28.6280, lng: 77.2390 },
  { id: 'sensor-003', name: 'Drain South Outlet', location: 'South District', lat: 28.5921, lng: 77.2100 },
  { id: 'sensor-004', name: 'Lake West Park', location: 'West District', lat: 28.6329, lng: 77.2195 },
  { id: 'sensor-005', name: 'Stream Central', location: 'Central District', lat: 28.6100, lng: 77.2300 },
  { id: 'sensor-006', name: 'Flood Gate Alpha', location: 'Industrial Zone', lat: 28.6450, lng: 77.2250 },
];

export function getAlertTier(waterLevel: number, maxLevel: number): AlertTier {
  const ratio = waterLevel / maxLevel;
  if (ratio >= 0.85) return 'emergency';
  if (ratio >= 0.65) return 'warning';
  if (ratio >= 0.45) return 'watch';
  return 'normal';
}

export function getTierColor(tier: AlertTier): string {
  switch (tier) {
    case 'normal': return '#10b981';
    case 'watch': return '#f59e0b';
    case 'warning': return '#f97316';
    case 'emergency': return '#ef4444';
  }
}

export function getTierLabel(tier: AlertTier): string {
  switch (tier) {
    case 'normal': return 'Normal';
    case 'watch': return 'Watch';
    case 'warning': return 'Warning';
    case 'emergency': return 'Emergency';
  }
}

export function generateInitialSensors(): SensorData[] {
  return SENSOR_LOCATIONS.map((loc, idx) => {
    const maxLevel = 300 + Math.random() * 100;
    const waterLevel = 50 + Math.random() * 150;
    const tier = getAlertTier(waterLevel, maxLevel);
    return {
      ...loc,
      waterLevel: Math.round(waterLevel * 10) / 10,
      maxLevel: Math.round(maxLevel),
      temperature: 22 + Math.random() * 15,
      humidity: 55 + Math.random() * 35,
      rainfall: Math.random() * 20,
      battery: 60 + Math.random() * 40,
      signal: -40 - Math.random() * 50,
      lastUpdated: new Date(),
      status: idx === 4 ? 'maintenance' : 'online',
      tier,
    };
  });
}

export function simulateSensorUpdate(sensor: SensorData): SensorData {
  const fluctuation = (Math.random() - 0.45) * 8;
  let newWaterLevel = sensor.waterLevel + fluctuation;
  newWaterLevel = Math.max(10, Math.min(sensor.maxLevel * 0.95, newWaterLevel));
  
  const newRainfall = Math.max(0, sensor.rainfall + (Math.random() - 0.5) * 5);
  const newTemp = sensor.temperature + (Math.random() - 0.5) * 0.5;
  const newHumidity = Math.min(100, Math.max(30, sensor.humidity + (Math.random() - 0.5) * 3));
  const newBattery = Math.max(0, sensor.battery - Math.random() * 0.1);
  
  const tier = getAlertTier(newWaterLevel, sensor.maxLevel);
  
  return {
    ...sensor,
    waterLevel: Math.round(newWaterLevel * 10) / 10,
    temperature: Math.round(newTemp * 10) / 10,
    humidity: Math.round(newHumidity * 10) / 10,
    rainfall: Math.round(newRainfall * 10) / 10,
    battery: Math.round(newBattery * 10) / 10,
    signal: sensor.signal + (Math.random() - 0.5) * 2,
    lastUpdated: new Date(),
    tier,
  };
}

export function generateHistoricalData(hours: number = 24): HistoricalData[] {
  const data: HistoricalData[] = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 100;
  
  let waterLevel = 80;
  let rainfall = 5;
  
  for (let i = 100; i >= 0; i--) {
    waterLevel += (Math.random() - 0.45) * 12;
    waterLevel = Math.max(20, Math.min(250, waterLevel));
    rainfall = Math.max(0, rainfall + (Math.random() - 0.5) * 4);
    
    data.push({
      timestamp: new Date(now - i * interval),
      waterLevel: Math.round(waterLevel * 10) / 10,
      rainfall: Math.round(rainfall * 10) / 10,
      temperature: 25 + Math.sin(i / 10) * 5 + Math.random() * 2,
    });
  }
  
  return data;
}

export function generateAlertEvents(sensors: SensorData[]): AlertEvent[] {
  const alerts: AlertEvent[] = [];
  const now = Date.now();
  
  sensors.forEach((sensor, idx) => {
    if (sensor.tier !== 'normal') {
      alerts.push({
        id: `alert-${idx}-${now}`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        tier: sensor.tier,
        message: getAlertMessage(sensor.tier, sensor.waterLevel, sensor.maxLevel),
        timestamp: new Date(now - Math.random() * 3600000),
        acknowledged: Math.random() > 0.5,
        waterLevel: sensor.waterLevel,
      });
    }
  });
  
  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function getAlertMessage(tier: AlertTier, level: number, max: number): string {
  const pct = Math.round((level / max) * 100);
  switch (tier) {
    case 'watch':
      return `Water level rising. Currently at ${pct}% capacity. Monitoring closely.`;
    case 'warning':
      return `Water level at ${pct}% capacity. Approaching danger threshold. Prepare for action.`;
    case 'emergency':
      return `CRITICAL: Water level at ${pct}% capacity! Immediate evacuation may be required.`;
    default:
      return 'All systems normal.';
  }
}
