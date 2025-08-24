import { LucideIcon } from 'lucide-react';

export interface SummaryCardData {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

interface StandardSummaryCardsProps {
  cards: SummaryCardData[];
  columns?: 3 | 4 | 5;
}

export function StandardSummaryCards({ 
  cards, 
  columns = 4 
}: StandardSummaryCardsProps) {
  // Handle undefined or empty cards
  if (!cards || cards.length === 0) {
    return null;
  }

  const gridClass = {
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
    5: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4'
  }[columns];

  return (
    <div className={gridClass}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        const iconBgColor = card.iconBgColor || 'bg-blue-100';
        const iconColor = card.iconColor || 'text-blue-600';
        
        return (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                )}
                {card.trend && (
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      card.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trend.isPositive ? '↑' : '↓'} {Math.abs(card.trend.value)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-2">vs last month</span>
                  </div>
                )}
              </div>
              <div className={`h-12 w-12 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0 ml-4`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}