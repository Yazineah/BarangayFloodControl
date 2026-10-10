import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Droplets, Thermometer, CloudRain, Battery } from 'lucide-react';
import { SensorData } from '../types';
import { getTierColor, getTierLabel } from '../data/simulation';

interface LiveFeedProps {
  sensors: SensorData[];
}

export default function LiveFeed({ sensors }: LiveFeedProps) {
  const onlineSensors = sensors.filter(s => s.status === 'online');

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-blue-400" />
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <h3 className="text-white font-semibold text-sm">Live Data Feed</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-emerald-400 text-[10px] font-medium uppercase tracking-wider">Streaming</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {onlineSensors.map((sensor, idx) => {
            const color = getTierColor(sensor.tier);
            return (
              <motion.div
                key={sensor.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 px-3 py-2 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                {/* Status dot */}
                <motion.div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                />

                {/* Sensor name */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{sensor.name}</p>
                  <p className="text-gray-500 text-[10px]">{sensor.lastUpdated.toLocaleTimeString()}</p>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-300 text-[10px] font-mono">{sensor.waterLevel.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-orange-400" />
                    <span className="text-orange-300 text-[10px] font-mono">{sensor.temperature.toFixed(1)}°</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 text-[10px] font-mono">{sensor.rainfall.toFixed(1)}</span>
                  </div>
                </div>

                {/* Tier badge */}
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {getTierLabel(sensor.tier)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer stats */}
      <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3 text-gray-500" />
            <span className="text-gray-400 text-[10px]">
              Avg: {(onlineSensors.reduce((sum, s) => sum + s.battery, 0) / onlineSensors.length).toFixed(0)}%
            </span>
          </div>
          <span className="text-gray-600 text-[10px]">|</span>
          <span className="text-gray-400 text-[10px]">
            {onlineSensors.length} active nodes
          </span>
        </div>
        <span className="text-gray-500 text-[10px] font-mono">
          Interval: 3s
        </span>
      </div>
    </div>
  );
}
