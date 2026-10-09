import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import AlertBanner from './components/AlertBanner';
import SystemOverview from './components/SystemOverview';
import SensorCard from './components/SensorCard';
import SensorMap from './components/SensorMap';
import SensorDetail from './components/SensorDetail';
import WaterLevelChart from './components/WaterLevelChart';
import AlertLog from './components/AlertLog';
import { SensorData, AlertEvent, AlertTier, HistoricalData, SystemStats } from './types';
import {
  generateInitialSensors,
  simulateSensorUpdate,
  generateHistoricalData,
  generateAlertEvents,
  getAlertTier,
} from './data/simulation';

export default function App() {
  const [sensors, setSensors] = useState<SensorData[]>(generateInitialSensors());
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>(generateHistoricalData());
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'sensors' | 'alerts'>('dashboard');

  // Determine highest alert tier
  const highestTier: AlertTier = sensors.reduce((highest, s) => {
    const tierOrder: AlertTier[] = ['normal', 'watch', 'warning', 'emergency'];
    return tierOrder.indexOf(s.tier) > tierOrder.indexOf(highest) ? s.tier : highest;
  }, 'normal' as AlertTier);

  // Generate alerts on initial load
  useEffect(() => {
    const initialAlerts = generateAlertEvents(sensors);
    setAlerts(initialAlerts);
  }, []);

  // Simulate real-time sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => {
        const updated = prev.map(sensor => {
          if (sensor.status === 'offline') return sensor;
          return simulateSensorUpdate(sensor);
        });
        return updated;
      });

      // Update historical data
      setHistoricalData(prev => {
        const newEntry = {
          timestamp: new Date(),
          waterLevel: 80 + Math.random() * 120 + Math.sin(Date.now() / 10000) * 30,
          rainfall: Math.max(0, 5 + Math.random() * 15),
          temperature: 25 + Math.sin(Date.now() / 20000) * 5,
        };
        return [...prev.slice(1), newEntry];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Generate new alerts when tier changes
  useEffect(() => {
    const nonNormalSensors = sensors.filter(s => s.tier !== 'normal');
    if (nonNormalSensors.length > 0) {
      const newAlerts: AlertEvent[] = nonNormalSensors.map(sensor => ({
        id: `alert-${sensor.id}-${Date.now()}`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        tier: sensor.tier,
        message: getAlertMessage(sensor.tier, sensor.waterLevel, sensor.maxLevel),
        timestamp: new Date(),
        acknowledged: false,
        waterLevel: sensor.waterLevel,
      }));

      setAlerts(prev => {
        const existingIds = new Set(prev.map(a => `${a.sensorId}-${a.tier}`));
        const freshAlerts = newAlerts.filter(a => !existingIds.has(`${a.sensorId}-${a.tier}`));
        return [...freshAlerts, ...prev].slice(0, 20);
      });
    }
  }, [sensors.map(s => `${s.id}-${s.tier}`).join(',')]);

  const handleAcknowledge = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const handleDismissBanner = useCallback(() => {
    setBannerVisible(false);
  }, []);

  // System stats
  const stats: SystemStats = {
    totalSensors: sensors.length,
    onlineSensors: sensors.filter(s => s.status === 'online').length,
    activeAlerts: alerts.filter(a => !a.acknowledged).length,
    avgWaterLevel: sensors.reduce((sum, s) => sum + s.waterLevel, 0) / sensors.length,
    maxWaterLevel: Math.max(...sensors.map(s => s.waterLevel)),
    systemUptime: 86400 + Math.floor(Date.now() / 1000) % 86400,
  };

  const bannerMessage = highestTier === 'emergency'
    ? 'CRITICAL: Multiple sensors reporting dangerous water levels. Immediate action required!'
    : highestTier === 'warning'
    ? 'Water levels are rising above warning thresholds in monitored areas.'
    : highestTier === 'watch'
    ? 'Elevated water levels detected. System is monitoring closely.'
    : 'All sensors reporting normal water levels. System operating within parameters.';

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header
        activeAlerts={stats.activeAlerts}
        highestTier={highestTier}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Alert Banner */}
      <div className="px-4 pt-3">
        <AlertBanner
          tier={highestTier}
          message={bannerMessage}
          visible={bannerVisible}
          onDismiss={handleDismissBanner}
        />
      </div>

      {/* Navigation tabs */}
      <div className="px-4 pt-3">
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1 w-fit">
          {(['dashboard', 'sensors', 'alerts'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                activeView === view
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {activeView === 'dashboard' && (
          <>
            {/* System Overview Stats */}
            <SystemOverview stats={stats} />

            {/* Charts and Map Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <WaterLevelChart data={historicalData} />
              <SensorMap sensors={sensors} onSensorClick={setSelectedSensor} />
            </div>

            {/* Sensors and Alerts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">Sensor Network Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {sensors.map(sensor => (
                      <SensorCard
                        key={sensor.id}
                        sensor={sensor}
                        onClick={() => setSelectedSensor(sensor)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <AlertLog alerts={alerts} onAcknowledge={handleAcknowledge} />
            </div>
          </>
        )}

        {activeView === 'sensors' && (
          <>
            <SystemOverview stats={stats} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensors.map(sensor => (
                <SensorCard
                  key={sensor.id}
                  sensor={sensor}
                  onClick={() => setSelectedSensor(sensor)}
                />
              ))}
            </div>
            <SensorMap sensors={sensors} onSensorClick={setSelectedSensor} />
          </>
        )}

        {activeView === 'alerts' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{alerts.filter(a => !a.acknowledged).length}</p>
                <p className="text-gray-400 text-sm mt-1">Unacknowledged</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400">{alerts.filter(a => a.acknowledged).length}</p>
                <p className="text-gray-400 text-sm mt-1">Acknowledged</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">{alerts.length}</p>
                <p className="text-gray-400 text-sm mt-1">Total Alerts</p>
              </div>
            </div>
            <AlertLog alerts={alerts} onAcknowledge={handleAcknowledge} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">FloodGuard v2.1.0</span>
            <span className="text-gray-600 text-xs">|</span>
            <span className="text-gray-500 text-xs">ESP32 IoT Network</span>
            <span className="text-gray-600 text-xs">|</span>
            <span className="text-gray-500 text-xs">PostgreSQL Backend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-400 text-xs">All systems operational</span>
          </div>
        </div>
      </footer>

      {/* Sensor Detail Modal */}
      {selectedSensor && (
        <SensorDetail
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
}

function getAlertMessage(tier: AlertTier, level: number, max: number): string {
  const pct = Math.round((level / max) * 100);
  switch (tier) {
    case 'watch':
      return `Water level rising. Currently at ${pct}% capacity. Monitoring closely.`;
    case 'warning':
      return `Water level at ${pct}% capacity. Approaching danger threshold.`;
    case 'emergency':
      return `CRITICAL: Water level at ${pct}% capacity! Immediate action required.`;
    default:
      return 'All systems normal.';
  }
}
