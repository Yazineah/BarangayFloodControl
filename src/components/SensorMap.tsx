import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { SensorData } from '../types';
import { getTierColor } from '../data/simulation';

interface SensorMapProps {
  sensors: SensorData[];
  onSensorClick: (sensor: SensorData) => void;
}

export default function SensorMap({ sensors, onSensorClick }: SensorMapProps) {
  // Normalize positions for display
  const minLat = Math.min(...sensors.map(s => s.lat));
  const maxLat = Math.max(...sensors.map(s => s.lat));
  const minLng = Math.min(...sensors.map(s => s.lng));
  const maxLng = Math.max(...sensors.map(s => s.lng));

  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * 80 + 10;
    const y = ((maxLat - lat) / (maxLat - minLat || 1)) * 80 + 10;
    return { x, y };
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Sensor Network Map</h3>
          <p className="text-gray-400 text-xs mt-0.5">Geographic distribution of monitoring nodes</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Maintenance
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-red-400" /> Offline
          </span>
        </div>
      </div>

      {/* Map visualization */}
      <div className="relative bg-gray-900 rounded-lg border border-gray-700 h-64 overflow-hidden">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[...Array(10)].map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#6b7280" strokeWidth="0.5" />
          ))}
          {[...Array(10)].map((_, i) => (
            <line key={`v-${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#6b7280" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Connection lines between sensors */}
        <svg className="absolute inset-0 w-full h-full">
          {sensors.map((sensor, idx) => {
            if (idx === 0) return null;
            const pos = getPosition(sensor.lat, sensor.lng);
            const prevPos = getPosition(sensors[idx - 1].lat, sensors[idx - 1].lng);
            return (
              <line
                key={`line-${idx}`}
                x1={`${prevPos.x}%`}
                y1={`${prevPos.y}%`}
                x2={`${pos.x}%`}
                y2={`${pos.y}%`}
                stroke={getTierColor(sensor.tier)}
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.3"
              />
            );
          })}
        </svg>

        {/* Sensor nodes */}
        {sensors.map((sensor) => {
          const pos = getPosition(sensor.lat, sensor.lng);
          const color = getTierColor(sensor.tier);
          return (
            <motion.button
              key={sensor.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.3 }}
              onClick={() => onSensorClick(sensor)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Pulse ring for alerts */}
              {sensor.tier !== 'normal' && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: color, opacity: 0.2 }}
                  animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <div
                className="w-4 h-4 rounded-full border-2 border-white/50 relative z-10"
                style={{ backgroundColor: color }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="bg-gray-900 border border-gray-600 rounded-lg px-2 py-1 whitespace-nowrap">
                  <p className="text-white text-xs font-medium">{sensor.name}</p>
                  <p className="text-gray-400 text-[10px]">{sensor.waterLevel} cm</p>
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Map label */}
        <div className="absolute bottom-2 right-2 text-gray-600 text-[10px]">
          <MapPin className="w-3 h-3 inline mr-1" />
          Monitoring Zone
        </div>
      </div>
    </div>
  );
}
