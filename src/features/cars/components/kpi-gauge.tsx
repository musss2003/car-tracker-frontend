import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
  Text as RechartsText,
} from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { AlertTriangle, Clock, CalendarCheck } from 'lucide-react';

// --- 1. Type Definitions ---
interface GaugeData {
  name: string;
  uv: number; // The value (percentage) for the radial bar
  fill: string; // Dynamic color
}

interface KPIGaugeProps {
  remainingValue: number;
  totalValue: number;
  title: string;
  unitLabel: string; // e.g., 'dana preostalo' or 'km preostalo'
  Icon: React.ElementType;
}

// --- 2. Color Logic ---
const getIndicatorColor = (
  percentage: number
): { hex: string; tailwindClass: string } => {
  // Percentage is UTILIZED percentage (0% remaining = 100% utilized)
  if (percentage >= 90) {
    // < 10% remaining
    return { hex: '#ef4444', tailwindClass: 'text-red-500' };
  }
  if (percentage >= 75) {
    // 10% - 25% remaining
    return { hex: '#f97316', tailwindClass: 'text-orange-500' };
  }
  return { hex: '#22c55e', tailwindClass: 'text-green-500' };
};

// --- 3. Component Implementation ---
export function KPIGauge({
  remainingValue,
  totalValue,
  title,
  unitLabel,
  Icon,
}: KPIGaugeProps) {
  // Calculate percentage of the interval *utilized*
  const utilizedValue = totalValue - remainingValue;
  const rawPercentage = (utilizedValue / totalValue) * 100;
  const percentage = Math.max(0, Math.min(100, Math.round(rawPercentage)));

  const { hex: colorHex, tailwindClass: colorClass } =
    getIndicatorColor(percentage);

  // Prepare data object
  const data: GaugeData[] = [
    {
      name: title,
      uv: percentage,
      fill: colorHex, // Dynamic color for the active bar
    },
  ];

  return (
    <Card className="p-4 text-center h-full flex flex-col items-center justify-center">
      <div className="flex items-center justify-center mb-2">
        <Icon className={`w-6 h-6 mr-2 ${colorClass}`} />
        <h4 className="font-bold text-lg text-foreground">{title}</h4>
      </div>

      {/* Set the aspect ratio for responsive scaling */}
      <ResponsiveContainer width="100%" height={150}>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="90%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          {/* PolarAngleAxis sets the scale (0 to 100) */}
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />

          {/* RadialBar displays the progress */}
          <RadialBar
            background={{ fill: '#e5e7eb' }} // Tailwind gray-200 for the background bar
            dataKey="uv"
            angleAxisId={0}
          />

          {/* Custom label in the middle of the gauge using Recharts Text component */}
          <RechartsText
            x={75} // Approximate center for 150px chart
            y={75}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={22}
            fontWeight="bold"
            fill={colorHex}
          >
            {`${percentage}%`}
          </RechartsText>
        </RadialBarChart>
      </ResponsiveContainer>

      <p className="text-sm mt-2 font-semibold text-muted-foreground">
        <span className="font-extrabold">
          {Math.max(0, remainingValue).toLocaleString()} {unitLabel}
        </span>
      </p>
    </Card>
  );
}
