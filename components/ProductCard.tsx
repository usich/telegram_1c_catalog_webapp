
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { NomenclatureItem } from '../types';
import { PriceSelector } from './PriceSelector';

interface Props {
  item: NomenclatureItem;
  onClick: (item: NomenclatureItem) => void;
  onAddToCart: (item: NomenclatureItem, price: number) => void;
}

export const ProductCard: React.FC<Props> = ({ item, onClick, onAddToCart }) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPrice !== null) {
      onAddToCart(item, currentPrice);
    }
  };

  const hasPrice = item.price && item.price.length > 0;
  
  // Map characteristics to standard label/price format
  // Use 'name' as label, fallback to "Стандарт" if empty
  const priceOptions = item.price?.map(p => ({
    label: p.name ? p.name : "Стандарт",
    price: p.price
  })) || [];

  return (
    <div 
      onClick={() => onClick(item)}
      className="bg-tg-bg border border-tg-secondary rounded-xl p-4 mb-2 cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex gap-3 items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-tg-text leading-tight mb-3 pr-2">{item.name}</h3>
          
          <div className="mt-1">
            {hasPrice ? (
              <PriceSelector 
                options={priceOptions} 
                onPriceChange={setCurrentPrice} 
                variant="list" 
              />
            ) : (
              <span className="text-tg-hint text-sm">Цена не указана</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!hasPrice}
          className={`
            flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors mt-1
            ${hasPrice 
              ? 'bg-tg-button text-tg-buttonText active:opacity-80' 
              : 'bg-tg-secondary text-tg-hint cursor-not-allowed'}
          `}
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
