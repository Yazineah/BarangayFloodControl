import { motion } from 'framer-motion';
import { Droplets, Thermometer, Wind, Battery, Wifi, MapPin } from 'lucide-react';
import { SensorData } from '../types';
import { getTierColor, getTierLabel } from '../data/simulation';

interface SensorCardProps {
  sensor: SensorData;
  onClick: () => void;
}

export default function SensorCard({ sensor, onClick }: SensorCardProps) {
  const tierColor = getTierColor(sensor.tier);
  const levelPercent = Math.round((sensor.waterLevel / sensor.maxLevel) * 100);

  const statusDot = sensor.status === 'online' ? 'bg-emerald-400' :
    sensor.status === 'offline' ? 'bg-red-400' : 'bg-amber-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className="bg-gray-800 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-gray-500 transition-colors relative overflow-hidden"
    >
      {/* Tier indicator bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: tierColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusDot} ${sensor.status === 'online' ? 'animate-pulse' : ''}`} />
            <h3 className="text-white font-semibold text-sm truncate">{sensor.name}</h3>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span className="text-gray-400 text-xs">{sensor.location}</span>
          </div>
        </div>
        <div
          className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
        >
          {getTierLabel(sensor.tier)}
        </div>
      </div>

      {/* Water Level - Main metric */}
      <div className="mb-3">
        <div className="flex items-end justify-between mb-1">
          <div className="flex items-center gap-1">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-xs font-medium">Water Level</span>
          </div>
          <span className="text-white font-bold text-lg">{sensor.waterLevel}<span className="text-gray-400 text-xs ml-0.5">cm</span></span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: tierColor }}
            initial={{ width: 0 }}
            animate={{ width: `${levelPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-500 text-xs">0 cm</span>
          <span className="text-gray-500 text-xs">{sensor.maxLevel} cm</span>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <Thermometer className="w-3 h-3 text-orange-400" />
            <span className="text-gray-400 text-xs">Temp</span>
          </div>
          <span className="text-white text-sm font-medium">{sensor.temperature.toFixed(1)}°C</span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span className="text-gray-400 text-xs">Rain</span>
          </div>
          <span className="text-white text-sm font-medium">{sensor.rainfall.toFixed(1)} mm/h</span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <Battery className="w-3 h-3 text-green-400" />
            <span className="text-gray-400 text-xs">Battery</span>
          </div>
          <span className="text-white text-sm font-medium">{sensor.battery.toFixed(0)}%</span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <Wifi className="w-3 h-3 text-purple-400" />
            <span className="text-gray-400 text-xs">Signal</span>
          </div>
          <span className="text-white text-sm font-medium">{sensor.signal.toFixed(0)} dBm</span>
        </div>
      </div>

      {/* Last updated */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <span className="text-gray-500 text-xs">
          Updated: {sensor.lastUpdated.toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}
