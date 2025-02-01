'use client';

import { useMemo } from 'react';
import {
    Line,
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/lib/dateUtils';
import type { DailyEntry } from '@/lib/types';

interface CalorieTrendChartProps {
    entries: DailyEntry[];
    targetCalories: number;
    maxCalories: number;
}

export function CalorieTrendChart({ entries, targetCalories, maxCalories }: CalorieTrendChartProps) {
    const chartData = useMemo(() => {
        return entries.slice().reverse().map(entry => ({
            date: formatDate(entry.date),
            calories: entry.totalCalories,
            target: targetCalories,
            max: maxCalories,
        }));
    }, [entries, targetCalories]);

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                    <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#6b7280' }}
                        tickMargin={10}
                    />
                    <YAxis
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#6b7280' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '0.375rem',
                            color: '#e5e7eb',
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="max"
                        stroke="#4b5563"
                        strokeDasharray="5 5"
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#4b5563"
                        strokeDasharray="5 5"
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="#9333ea"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#9333ea' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
