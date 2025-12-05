import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon, trend, trendValue, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse shadow-sm">
        <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-100 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-xand-200 transition-colors shadow-sm hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {subValue && <p className="text-slate-400 text-xs mt-1">{subValue}</p>}
        </div>
        {icon && <div className="p-3 bg-slate-50 rounded-lg text-xand-600 text-xl border border-slate-100">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'} font-medium flex items-center gap-1`}>
            {trend === 'up' ? <i className="fas fa-arrow-up"></i> : trend === 'down' ? <i className="fas fa-arrow-down"></i> : <i className="fas fa-minus"></i>}
            {trendValue}
          </span>
          <span className="text-slate-400 ml-2">vs last epoch</span>
        </div>
      )}
    </div>
  );
};