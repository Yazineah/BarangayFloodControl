import { motion } from 'framer-motion';
import { Activity, Wifi, AlertTriangle, Droplets, Server, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { SystemStats } from '../types';

interface SystemOverviewProps {
  stats: SystemStats;
}

export default function SystemOverview({ stats }: SystemOverviewProps) {
  const uptimeHours = Math.floor(stats.systemUptime / 3600);
  const uptimeMins = Math.floor((stats.systemUptime % 3600) / 60);

  const cards = [
    {
      icon: Wifi,
      label: 'Sensors Online',
      value: `${stats.onlineSensors}/${stats.totalSensors}`,
      sub: `${Math.round((stats.onlineSensors / stats.totalSensors) * 100)}% uptime`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      icon: AlertTriangle,
      label: 'Active Alerts',
      value: stats.activeAlerts.toString(),
      sub: stats.activeAlerts > 0 ? 'Requires attention' : 'All clear',
      color: stats.activeAlerts > 0 ? 'text-red-400' : 'text-emerald-400',
      bgColor: stats.activeAlerts > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      borderColor: stats.activeAlerts > 0 ? 'border-red-500/20' : 'border-emerald-500/20',
    },
    {
      icon: Droplets,
      label: 'Avg Water Level',
      value: `${stats.avgWaterLevel.toFixed(1)} cm`,
      sub: 'Across all sensors',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      icon: Activity,
      label: 'Peak Level',
      value: `${stats.maxWaterLevel.toFixed(1)} cm`,
      sub: stats.maxWaterLevel > 200 ? 'Above threshold' : 'Within limits',
      color: stats.maxWaterLevel > 200 ? 'text-orange-400' : 'text-blue-400',
      bgColor: stats.maxWaterLevel > 200 ? 'bg-orange-500/10' : 'bg-blue-500/10',
      borderColor: stats.maxWaterLevel > 200 ? 'border-orange-500/20' : 'border-blue-500/20',
    },
    {
      icon: Server,
      label: 'Server Status',
      value: 'Healthy',
      sub: 'API responding normally',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      icon: Clock,
      label: 'Uptime',
      value: `${uptimeHours}h ${uptimeMins}m`,
      sub: 'Since last restart',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={`bg-gray-800 border ${card.borderColor} rounded-xl p-3 hover:bg-gray-750 transition-colors group`}
        >
          <div className={`${card.bgColor} w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <p className="text-gray-400 text-xs">{card.label}</p>
          <p className={`text-white font-bold text-lg ${card.color}`}>{card.value}</p>
          <p className="text-gray-500 text-[10px] mt-0.5">{card.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
