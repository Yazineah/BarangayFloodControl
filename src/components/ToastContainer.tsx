import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, ShieldAlert, X, CheckCircle } from 'lucide-react';
import { AlertTier } from '../types';
import { getTierColor, getTierLabel } from '../data/simulation';

export interface Toast {
  id: string;
  tier: AlertTier;
  message: string;
  timestamp: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const tierIcons = {
  normal: CheckCircle,
  watch: AlertTriangle,
  warning: AlertCircle,
  emergency: ShieldAlert,
};

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-[60] space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = tierIcons[toast.tier];
          const color = getTierColor(toast.tier);
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-2xl shadow-black/30 overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />
              
              <div className="flex items-start gap-3">
                <div
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase" style={{ color }}>
                      {getTierLabel(toast.tier)}
                    </span>
                    <span className="text-gray-600 text-[10px]">
                      {new Date(toast.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 text-gray-500 hover:text-white rounded transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Auto-dismiss progress bar */}
              <motion.div
                className="h-0.5 mt-2 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
