import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Activity, Menu, X, Bell, Settings, Shield } from 'lucide-react';

interface HeaderProps {
  activeAlerts: number;
  highestTier: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function Header({ activeAlerts, highestTier, onToggleSidebar, sidebarOpen }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const statusColor = highestTier === 'emergency' ? 'bg-red-500' :
    highestTier === 'warning' ? 'bg-orange-500' :
    highestTier === 'watch' ? 'bg-amber-500' : 'bg-emerald-500';

  const statusLabel = highestTier === 'emergency' ? 'CRITICAL' :
    highestTier === 'warning' ? 'WARNING' :
    highestTier === 'watch' ? 'WATCH' : 'NORMAL';

  return (
    <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-3">
          <motion.div 
            className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Droplets className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
              Flood<span className="text-blue-400">Guard</span>
            </h1>
            <p className="text-gray-400 text-xs flex items-center gap-1">
              <Shield className="w-3 h-3" />
              IoT Monitoring System v2.1
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* System Status Badge */}
        <div className="hidden md:flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-3 py-1.5">
          <motion.div 
            className={`w-2 h-2 rounded-full ${statusColor}`}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-gray-300 text-xs font-medium">{statusLabel}</span>
        </div>

        {/* Clock */}
        <div className="hidden sm:block text-right">
          <div className="text-white text-sm font-mono tabular-nums">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-gray-400 text-[10px]">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <motion.button 
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5" />
          </motion.button>
          {activeAlerts > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg shadow-red-500/30"
            >
              {activeAlerts}
            </motion.span>
          )}
        </div>

        {/* Settings */}
        <motion.button 
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.3 }}
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>
    </header>
  );
}
