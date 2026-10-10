import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { HistoricalData } from '../types';

interface WaterLevelChartProps {
  data: HistoricalData[];
}

export default function WaterLevelChart({ data }: WaterLevelChartProps) {
  const chartData = useMemo(() =>
    data.map(d => ({
      ...d,
      time: d.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    })),
    [data]
  );

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Water Level History</h3>
          <p className="text-gray-400 text-xs mt-0.5">Last 24 hours monitoring data</p>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md font-medium">24H</span>
          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-md cursor-pointer hover:bg-gray-600">7D</span>
          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-md cursor-pointer hover:bg-gray-600">30D</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area
              type="monotone"
              dataKey="waterLevel"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#waterGradient)"
              name="Water Level (cm)"
            />
            <Area
              type="monotone"
              dataKey="rainfall"
              stroke="#06b6d4"
              strokeWidth={1.5}
              fill="url(#rainGradient)"
              name="Rainfall (mm/h)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Rainfall bar chart */}
      <div className="mt-4">
        <h4 className="text-gray-300 text-xs font-medium mb-2">Rainfall Distribution</h4>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.filter((_, i) => i % 5 === 0)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={9} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="rainfall" fill="#06b6d4" radius={[2, 2, 0, 0]} name="Rainfall (mm/h)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
