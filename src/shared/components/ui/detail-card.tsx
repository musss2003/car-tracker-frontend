import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface DetailCardProps {
  title: string;
  icon: ReactNode;
  borderColor: string;
  gradientColor: string;
  textColor: string;
  children: ReactNode;
  className?: string;
}

export function DetailCard({
  title,
  icon,
  borderColor,
  gradientColor,
  textColor,
  children,
  className = '',
}: DetailCardProps) {
  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col ${className}`}
    >
      <div
        className={`h-1 w-full ${borderColor.replace('border-l-', 'bg-')}`}
      />
      <CardHeader
        className={`bg-gradient-to-r ${gradientColor} to-transparent pb-3`}
      >
        <CardTitle className={`flex items-center gap-2 text-base ${textColor}`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        {children}
      </CardContent>
    </Card>
  );
}
