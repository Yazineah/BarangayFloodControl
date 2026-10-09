import { motion } from 'framer-motion';
import { Activity, Wifi, AlertTriangle, Droplets, Server, Clock } from 'lucide-react';
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
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: AlertTriangle,
      label: 'Active Alerts',
      value: stats.activeAlerts.toString(),
      color: stats.activeAlerts > 0 ? 'text-red-400' : 'text-emerald-400',
      bgColor: stats.activeAlerts > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10',
    },
    {
      icon: Droplets,
      label: 'Avg Water Level',
      value: `${stats.avgWaterLevel.toFixed(1)} cm`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Activity,
      label: 'Peak Level',
      value: `${stats.maxWaterLevel.toFixed(1)} cm`,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Server,
      label: 'Server Status',
      value: 'Healthy',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Clock,
      label: 'Uptime',
      value: `${uptimeHours}h ${uptimeMins}m`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
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
          className="bg-gray-800 border border-gray-700 rounded-xl p-3"
        >
          <div className={`${card.bgColor} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <p className="text-gray-400 text-xs">{card.label}</p>
          <p className={`text-white font-bold text-lg ${card.color}`}>{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
