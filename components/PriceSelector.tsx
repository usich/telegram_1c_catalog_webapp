import React, { useEffect, useMemo, useState } from 'react';

export interface PriceOption {
  label: string;
  price: number;
}

interface PriceSelectorProps {
  options: PriceOption[];
  onPriceChange: (price: number) => void;
  variant: 'list' | 'detail';
}

export const PriceSelector: React.FC<PriceSelectorProps> = ({ options, onPriceChange, variant }) => {
  // Sort prices ascending
  const sortedPrices = useMemo(() => {
    return [...options].sort((a, b) => a.price - b.price);
  }, [options]);

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  useEffect(() => {
    if (sortedPrices.length > 0) {
      onPriceChange(sortedPrices[selectedIdx].price);
    }
  }, [sortedPrices, selectedIdx, onPriceChange]);

  if (!options || options.length === 0) return null;

  // Single price case
  if (options.length === 1) {
    return (
      <div className="text-lg font-bold text-tg-text">
        {options[0].price.toLocaleString()} ₽
      </div>
    );
  }

  // Multiple prices
  return (
    <div className="w-full">
      <div className="text-lg font-bold text-tg-text mb-2">
        {sortedPrices[selectedIdx].price.toLocaleString()} ₽
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto space-x-2 pb-2 no-scrollbar">
        {sortedPrices.map((p, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation(); // Prevent clicking parent card
              setSelectedIdx(idx);
            }}
            className={`
              flex-shrink-0 rounded-md text-sm border transition-colors whitespace-nowrap
              ${selectedIdx === idx 
                ? 'bg-tg-button text-tg-buttonText border-tg-button' 
                : 'bg-tg-bg text-tg-text border-tg-hint hover:bg-tg-secondary'
              }
              ${variant === 'list' ? 'text-xs py-1 px-2' : 'text-sm py-2 px-4'}
            `}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};