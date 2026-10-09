import { motion } from 'framer-motion';
import { Database, Server, Cpu, Monitor, ArrowRight, ArrowDown, Wifi, Cloud, Shield, Bell } from 'lucide-react';

export default function SystemArchitecture() {
  const layers = [
    {
      title: 'IoT Sensor Layer',
      icon: Cpu,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      items: ['ESP32 Microcontroller', 'Ultrasonic Water Level Sensor', 'DHT22 Temp/Humidity', 'Rain Gauge Module', 'Solar Power + Battery'],
    },
    {
      title: 'Communication Layer',
      icon: Wifi,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      items: ['WiFi / LoRaWAN Gateway', 'MQTT Protocol', 'TLS Encryption', 'OTA Firmware Updates', 'Heartbeat Monitoring'],
    },
    {
      title: 'Backend API Layer',
      icon: Server,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      items: ['Node.js + Express', 'REST API Endpoints', 'WebSocket Real-time', 'JWT Authentication', 'Rate Limiting & CORS'],
    },
    {
      title: 'Data Layer',
      icon: Database,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      items: ['PostgreSQL Database', 'Redis Cache & OTP Store', 'Time-series Data', 'Alert History Logs', 'Backup & Replication'],
    },
    {
      title: 'Alert & Notification',
      icon: Bell,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      items: ['4-Tier Alert System', 'SMS via Twilio', 'Email Notifications', 'Push Notifications', 'Public Alert Sirens'],
    },
    {
      title: 'Frontend Dashboard',
      icon: Monitor,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      items: ['React + TypeScript', 'Real-time Charts', 'Interactive Map', '4-Tier Alert Banner', 'Mobile Responsive'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Architecture Diagram */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white font-bold text-lg mb-2">System Architecture</h3>
        <p className="text-gray-400 text-sm mb-6">End-to-end IoT flood monitoring pipeline</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layers.map((layer, idx) => (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`border ${layer.borderColor} rounded-xl p-4 relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 opacity-50" style={{ background: `linear-gradient(to right, transparent, currentColor, transparent)` }} />
              <div className="flex items-center gap-2 mb-3">
                <div className={`${layer.bgColor} p-2 rounded-lg`}>
                  <layer.icon className={`w-4 h-4 ${layer.color}`} />
                </div>
                <h4 className={`font-semibold text-sm ${layer.color}`}>{layer.title}</h4>
              </div>
              <ul className="space-y-1.5">
                {layer.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full ${layer.color} opacity-60`} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Flow */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Data Flow Pipeline</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
          {[
            { label: 'Sensor Reading', sub: 'Every 30s' },
            { label: 'WiFi/LoRa', sub: 'Transmission' },
            { label: 'API Ingest', sub: 'Validate & Store' },
            { label: 'Alert Engine', sub: '4-Tier Analysis' },
            { label: 'Dashboard', sub: 'Real-time View' },
          ].map((step, idx, arr) => (
            <div key={step.label} className="flex items-center gap-2 md:gap-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15 }}
                className="bg-gray-900 border border-gray-600 rounded-lg p-3 text-center min-w-[120px]"
              >
                <p className="text-white text-xs font-medium">{step.label}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{step.sub}</p>
              </motion.div>
              {idx < arr.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-600 hidden md:block mx-1" />
              )}
              {idx < arr.length - 1 && (
                <ArrowDown className="w-4 h-4 text-gray-600 md:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alert Tier Thresholds */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">4-Tier Alert Thresholds</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { tier: 'Normal', range: '0-45%', color: '#10b981', desc: 'All systems operating within safe parameters', icon: Shield },
            { tier: 'Watch', range: '45-65%', color: '#f59e0b', desc: 'Elevated levels detected, monitoring intensified', icon: Cloud },
            { tier: 'Warning', range: '65-85%', color: '#f97316', desc: 'Danger threshold approaching, alerts dispatched', icon: Bell },
            { tier: 'Emergency', range: '85-100%', color: '#ef4444', desc: 'Critical levels! Immediate evacuation protocols', icon: Shield },
          ].map((item, idx) => (
            <motion.div
              key={item.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-xl p-4 border"
              style={{ borderColor: `${item.color}40`, backgroundColor: `${item.color}08` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
                <span className="font-bold text-sm" style={{ color: item.color }}>{item.tier}</span>
              </div>
              <div className="text-white font-mono text-lg mb-1">{item.range}</div>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              <div className="mt-3 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: item.range.split('-')[1], backgroundColor: item.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Technology Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'ESP32', category: 'Hardware', color: 'text-cyan-400' },
            { name: 'Arduino IDE', category: 'Firmware', color: 'text-teal-400' },
            { name: 'Node.js', category: 'Backend', color: 'text-green-400' },
            { name: 'Express.js', category: 'API Framework', color: 'text-gray-300' },
            { name: 'PostgreSQL', category: 'Database', color: 'text-blue-400' },
            { name: 'Redis', category: 'Cache', color: 'text-red-400' },
            { name: 'React', category: 'Frontend', color: 'text-cyan-300' },
            { name: 'TypeScript', category: 'Language', color: 'text-blue-300' },
            { name: 'Tailwind CSS', category: 'Styling', color: 'text-sky-400' },
            { name: 'Recharts', category: 'Charts', color: 'text-purple-400' },
            { name: 'MQTT', category: 'Protocol', color: 'text-orange-400' },
            { name: 'Docker', category: 'Deployment', color: 'text-blue-500' },
          ].map((tech) => (
            <div key={tech.name} className="bg-gray-900 rounded-lg p-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${tech.color.replace('text-', 'bg-')}`} />
              <div>
                <p className={`text-sm font-medium ${tech.color}`}>{tech.name}</p>
                <p className="text-gray-500 text-[10px]">{tech.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
