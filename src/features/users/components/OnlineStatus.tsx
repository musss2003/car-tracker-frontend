import React from 'react';

interface OnlineStatusProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lastActiveAt?: string;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  isOnline,
  size = 'md',
  showText = false,
  lastActiveAt,
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const getLastActiveText = () => {
    if (!lastActiveAt) return 'Nikada';

    const now = new Date().getTime();
    const lastActive = new Date(lastActiveAt).getTime();
    const diffMinutes = Math.floor((now - lastActive) / (60 * 1000));

    if (diffMinutes < 1) return 'Upravo sada';
    if (diffMinutes < 60) return `Prije ${diffMinutes} min`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Prije ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Prije ${diffDays} dana`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
          title={isOnline ? 'Online' : `Zadnje aktivan: ${getLastActiveText()}`}
        />
        {isOnline && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 animate-ping opacity-75`}
          />
        )}
      </div>
      {showText && (
        <span
          className={`text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`}
        >
          {isOnline ? 'Online' : getLastActiveText()}
        </span>
      )}
    </div>
  );
};
