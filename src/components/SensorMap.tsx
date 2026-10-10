import { motion } from 'framer-motion';
import { MapPin, Radio, Waves } from 'lucide-react';
import { SensorData } from '../types';
import { getTierColor, getTierLabel } from '../data/simulation';

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
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * 70 + 15;
    const y = ((maxLat - lat) / (maxLat - minLat || 1)) * 70 + 15;
    return { x, y };
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            Sensor Network Map
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">Geographic distribution of monitoring nodes</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Maint.
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-red-400" /> Offline
          </span>
        </div>
      </div>

      {/* Map visualization */}
      <div className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 rounded-xl border border-gray-700 h-72 overflow-hidden">
        {/* Topographic-style background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]">
          {[...Array(20)].map((_, i) => (
            <circle key={`c-${i}`} cx="50%" cy="50%" r={`${i * 5}%`} fill="none" stroke="#60a5fa" strokeWidth="0.5" />
          ))}
        </svg>
        
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
          {[...Array(12)].map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={`${i * 8.33}%`} x2="100%" y2={`${i * 8.33}%`} stroke="#6b7280" strokeWidth="0.5" />
          ))}
          {[...Array(12)].map((_, i) => (
            <line key={`v-${i}`} x1={`${i * 8.33}%`} y1="0" x2={`${i * 8.33}%`} y2="100%" stroke="#6b7280" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Water/river decoration */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <path d="M 0 60% Q 20% 55%, 35% 65% T 70% 50% T 100% 55%" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          <path d="M 0 62% Q 20% 57%, 35% 67% T 70% 52% T 100% 57%" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>

        {/* Connection lines between sensors - mesh network */}
        <svg className="absolute inset-0 w-full h-full">
          {sensors.map((sensor, idx) => {
            return sensors.slice(idx + 1).map((other, j) => {
              const pos1 = getPosition(sensor.lat, sensor.lng);
              const pos2 = getPosition(other.lat, other.lng);
              const dist = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
              if (dist > 50) return null; // Only connect nearby sensors
              return (
                <line
                  key={`line-${idx}-${j}`}
                  x1={`${pos1.x}%`}
                  y1={`${pos1.y}%`}
                  x2={`${pos2.x}%`}
                  y2={`${pos2.y}%`}
                  stroke={getTierColor(sensor.tier)}
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                  opacity="0.25"
                />
              );
            });
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
              whileHover={{ scale: 1.4 }}
              onClick={() => onSensorClick(sensor)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Signal range ring */}
              <motion.div
                className="absolute rounded-full border"
                style={{ borderColor: `${color}20`, width: '40px', height: '40px', left: '-14px', top: '-14px' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
              />
              {/* Pulse ring for alerts */}
              {sensor.tier !== 'normal' && (
                <motion.div
                  className="absolute rounded-full"
                  style={{ backgroundColor: color, width: '30px', height: '30px', left: '-9px', top: '-9px' }}
                  animate={{ scale: [1, 2.5, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <div
                className="w-5 h-5 rounded-full border-2 border-white/60 relative z-10 shadow-lg"
                style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}40` }}
              />
              {/* Inner dot */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                  <p className="text-white text-xs font-semibold">{sensor.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400 text-[10px]">{sensor.waterLevel} cm</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${color}20`, color }}>
                      {getTierLabel(sensor.tier)}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-600 rotate-45" />
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Map overlay info */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg px-2 py-1 flex items-center gap-1.5">
            <Waves className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400 text-[10px] font-medium">Flood Monitoring Zone</span>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg px-2 py-1">
            <span className="text-gray-400 text-[10px] font-mono">{sensors.length} nodes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
