import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { AlertEvent } from '../types';
import { getTierColor } from '../data/simulation';

interface AlertLogProps {
  alerts: AlertEvent[];
  onAcknowledge: (id: string) => void;
}

const tierIcons = {
  normal: Info,
  watch: AlertTriangle,
  warning: AlertCircle,
  emergency: ShieldAlert,
};

export default function AlertLog({ alerts, onAcknowledge }: AlertLogProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Alert Log</h3>
          <p className="text-gray-400 text-xs mt-0.5">Recent system alerts</p>
        </div>
        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-md font-medium">
          {alerts.filter(a => !a.acknowledged).length} Active
        </span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No active alerts</p>
              <p className="text-gray-500 text-xs">All systems operating normally</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = tierIcons[alert.tier];
              const color = getTierColor(alert.tier);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`p-3 rounded-lg border transition-colors ${
                    alert.acknowledged
                      ? 'bg-gray-900/50 border-gray-700 opacity-60'
                      : 'bg-gray-900 border-gray-600'
                  }`}
                  style={{ borderLeftWidth: '3px', borderLeftColor: color }}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-medium">{alert.sensorName}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {alert.tier}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-gray-500 text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                        <span className="text-gray-500 text-[10px]">
                          Level: {alert.waterLevel.toFixed(1)} cm
                        </span>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-[10px] rounded transition-colors flex-shrink-0"
                      >
                        Ack
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
