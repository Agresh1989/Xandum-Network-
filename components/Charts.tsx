
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { HistoricalMetric, PNode } from '../types';

interface UptimeChartProps {
  data: HistoricalMetric[];
}

export const UptimeChart: React.FC<UptimeChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(val) => new Date(val).getHours() + 'h'} 
            stroke="#94a3b8" 
            tick={{fontSize: 12, fill: '#64748b'}}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={[80, 100]} 
            stroke="#94a3b8" 
            tick={{fontSize: 12, fill: '#64748b'}}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#0ea5e9' }}
            labelStyle={{ color: '#64748b' }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Uptime']}
            labelFormatter={(label) => new Date(label).toLocaleTimeString()}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#0ea5e9" 
            fillOpacity={1} 
            fill="url(#colorUptime)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface StatsProps {
  nodes: PNode[];
}

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

export const VersionDistributionChart: React.FC<StatsProps> = ({ nodes }) => {
  const data = React.useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach(n => {
      counts[n.version] = (counts[n.version] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
  }, [nodes]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,1)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ color: '#1e293b' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-slate-600 text-xs ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RegionBarChart: React.FC<StatsProps> = ({ nodes }) => {
  const data = React.useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach(n => {
      counts[n.region] = (counts[n.region] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
  }, [nodes]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" tick={{fontSize: 11, fill: '#64748b'}} />
          <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{fontSize: 11, fill: '#64748b'}} />
          <Tooltip 
            cursor={{fill: '#f1f5f9'}}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            itemStyle={{ color: '#0ea5e9' }}
          />
          <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ReportRadarChart: React.FC<{ metrics: any }> = ({ metrics }) => {
  const data = [
    { subject: 'Uptime', A: metrics.uptimeScore, fullMark: 100 },
    { subject: 'Latency', A: metrics.latencyScore, fullMark: 100 },
    { subject: 'Consistency', A: metrics.consistencyScore, fullMark: 100 },
    { subject: 'Vote Dist', A: metrics.voteDistanceScore || 85, fullMark: 100 }, 
    { subject: 'Participation', A: metrics.participationScore || 90, fullMark: 100 },
  ];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Validator" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
