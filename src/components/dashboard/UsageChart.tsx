import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyUsage } from '../../types';

interface UsageChartProps {
  data: MonthlyUsage[];
}

export function UsageChart({ data }: UsageChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="usage_hours" stroke="#14B8A6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}