import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Thermometer, Wind, Battery, Wifi, MapPin, Clock, TrendingUp } from 'lucide-react';
import { SensorData } from '../types';
import { getTierColor, getTierLabel } from '../data/simulation';

interface SensorDetailProps {
  sensor: SensorData | null;
  onClose: () => void;
}

export default function SensorDetail({ sensor, onClose }: SensorDetailProps) {
  if (!sensor) return null;

  const tierColor = getTierColor(sensor.tier);
  const levelPercent = Math.round((sensor.waterLevel / sensor.maxLevel) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-700 relative">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: tierColor }} />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">{sensor.name}</h2>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400 text-sm">{sensor.location}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Status badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${sensor.status === 'online' ? 'bg-emerald-400 animate-pulse' : sensor.status === 'offline' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <span className="text-gray-300 text-sm capitalize">{sensor.status}</span>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
              >
                {getTierLabel(sensor.tier)} Tier
              </span>
            </div>

            {/* Water Level - Main */}
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 text-sm font-medium">Water Level</span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-white">{sensor.waterLevel.toFixed(1)}</span>
                <span className="text-gray-400 text-sm mb-1">/ {sensor.maxLevel} cm</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: tierColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${levelPercent}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-500 text-xs">0%</span>
                <span className="text-gray-500 text-xs">{levelPercent}% capacity</span>
                <span className="text-gray-500 text-xs">100%</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-400 text-xs">Temperature</span>
                </div>
                <span className="text-white font-bold text-lg">{sensor.temperature.toFixed(1)}°C</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-400 text-xs">Humidity</span>
                </div>
                <span className="text-white font-bold text-lg">{sensor.humidity.toFixed(1)}%</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-xs">Rainfall</span>
                </div>
                <span className="text-white font-bold text-lg">{sensor.rainfall.toFixed(1)} <span className="text-xs text-gray-400">mm/h</span></span>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Battery className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-xs">Battery</span>
                </div>
                <span className="text-white font-bold text-lg">{sensor.battery.toFixed(0)}%</span>
              </div>
            </div>

            {/* Device Info */}
            <div className="bg-gray-900 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Signal Strength
                </span>
                <span className="text-white text-xs font-medium">{sensor.signal.toFixed(0)} dBm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last Updated
                </span>
                <span className="text-white text-xs font-medium">{sensor.lastUpdated.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Coordinates
                </span>
                <span className="text-white text-xs font-mono">{sensor.lat.toFixed(4)}, {sensor.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
