import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Activity, Menu, X, Bell, Settings } from 'lucide-react';

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

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">FloodGuard</h1>
            <p className="text-gray-400 text-xs">IoT Monitoring System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
          <span className="text-gray-300 text-sm">System Active</span>
        </div>

        <div className="hidden sm:block text-right">
          <div className="text-white text-sm font-mono">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-gray-400 text-xs">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div className="relative">
          <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          {activeAlerts > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
            >
              {activeAlerts}
            </motion.span>
          )}
        </div>

        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
