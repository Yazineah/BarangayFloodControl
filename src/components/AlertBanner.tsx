import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, X } from 'lucide-react';
import { AlertTier } from '../types';
import { getTierColor, getTierLabel } from '../data/simulation';

interface AlertBannerProps {
  tier: AlertTier;
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

const tierIcons = {
  normal: Info,
  watch: AlertTriangle,
  warning: AlertCircle,
  emergency: ShieldAlert,
};

const tierBg = {
  normal: 'bg-emerald-50 border-emerald-300',
  watch: 'bg-amber-50 border-amber-300',
  warning: 'bg-orange-50 border-orange-300',
  emergency: 'bg-red-50 border-red-300',
};

const tierText = {
  normal: 'text-emerald-800',
  watch: 'text-amber-800',
  warning: 'text-orange-800',
  emergency: 'text-red-800',
};

const tierPulse = {
  normal: '',
  watch: '',
  warning: 'animate-pulse',
  emergency: 'animate-pulse',
};

export default function AlertBanner({ tier, message, visible, onDismiss }: AlertBannerProps) {
  const Icon = tierIcons[tier];
  const color = getTierColor(tier);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`border-l-4 ${tierBg[tier]} ${tierPulse[tier]} rounded-r-lg shadow-lg overflow-hidden`}
          style={{ borderLeftColor: color }}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${tier === 'emergency' ? 'bg-red-200' : tier === 'warning' ? 'bg-orange-200' : tier === 'watch' ? 'bg-amber-200' : 'bg-emerald-200'}`}>
                <Icon className={`w-5 h-5 ${tierText[tier]}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm uppercase tracking-wider ${tierText[tier]}`}>
                    {getTierLabel(tier)} Alert
                  </span>
                  {tier === 'emergency' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                      ACTION REQUIRED
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-0.5 ${tierText[tier]} opacity-80`}>{message}</p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className={`p-1 rounded-full hover:bg-black/10 transition-colors ${tierText[tier]}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {tier === 'emergency' && (
            <motion.div
              className="h-1 bg-red-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              style={{ transformOrigin: 'left' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
