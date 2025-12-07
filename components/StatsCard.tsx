
import React, { useState, useEffect, useRef } from 'react';

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
  const [animateValue, setAnimateValue] = useState(false);
  const [animateSub, setAnimateSub] = useState(false);
  const [highlight, setHighlight] = useState(false);
  
  const prevValue = useRef(value);
  const prevSubValue = useRef(subValue);

  // Animate main value on change
  useEffect(() => {
    if (prevValue.current !== value) {
      setAnimateValue(true);
      setHighlight(true); // Trigger card flash
      const timer = setTimeout(() => {
          setAnimateValue(false);
          setHighlight(false);
      }, 800); // Duration of the flash
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  // Animate subValue on change
  useEffect(() => {
    if (prevSubValue.current !== subValue) {
      setAnimateSub(true);
      const timer = setTimeout(() => setAnimateSub(false), 800);
      prevSubValue.current = subValue;
      return () => clearTimeout(timer);
    }
  }, [subValue]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse shadow-sm">
        <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-100 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 hover:border-xand-200 transition-all duration-500 shadow-sm hover:shadow-md ${
        highlight ? 'bg-indigo-50/50 border-indigo-100 ring-1 ring-indigo-50' : ''
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-2xl font-bold transition-all duration-500 transform origin-left flex items-center gap-2 ${
              animateValue ? 'text-indigo-600 scale-110' : 'text-slate-900 scale-100'
          }`}>
            {value}
            {animateValue && <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>}
          </h3>
          {subValue && (
            <p className={`text-xs mt-1 transition-all duration-500 ${
                animateSub ? 'text-indigo-600 font-bold' : 'text-slate-400'
            }`}>
                {subValue}
            </p>
          )}
        </div>
        {icon && (
            <div className={`p-3 rounded-lg text-xl border transition-colors duration-500 ${
                highlight ? 'bg-white text-indigo-500 border-indigo-100' : 'bg-slate-50 text-xand-600 border-slate-100'
            }`}>
                {icon}
            </div>
        )}
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
