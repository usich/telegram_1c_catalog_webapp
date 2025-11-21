
import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { NomenclatureItem } from '../types';
import { PriceSelector } from './PriceSelector';
import { useStore } from '../context/StoreContext';

interface Props {
  item: NomenclatureItem;
  onClick: (item: NomenclatureItem) => void;
  onAddToCart: (item: NomenclatureItem, price: number) => void; // Unused but kept for compatibility
}

export const ProductCard: React.FC<Props> = ({ item, onClick }) => {
  const { addToCart, cart, updateCartItemCount, setCartItemCount } = useStore();
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  
  const hasPrice = item.price && item.price.length > 0;
  
  const priceOptions = item.price?.map(p => ({
    label: p.name ? p.name : "Стандарт",
    price: p.price,
    original: p
  })) || [];

  // Logic to find current cart item based on selected price/variant
  const currentVariant = item.price?.find(p => p.price === currentPrice) || (item.price ? item.price[0] : null);
  const charRef = currentVariant?.ref || "";
  const cartItemId = `${item.ref}_${charRef}`;
  
  const cartItem = cart.find(c => c.id === cartItemId);
  const count = cartItem ? cartItem.count : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentVariant) {
      addToCart(item, currentVariant);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartItemCount(cartItemId, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartItemCount(cartItemId, -1);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) {
          setCartItemCount(cartItemId, val);
      } else if (e.target.value === '') {
          setCartItemCount(cartItemId, 0);
      }
  };

  const handleInputClick = (e: React.MouseEvent) => {
      e.stopPropagation();
  };

  return (
    <div 
      onClick={() => onClick(item)}
      className={`
        bg-tg-bg border rounded-xl p-4 mb-2 cursor-pointer active:scale-[0.99] transition-all relative
        ${count > 0 ? 'border-green-500 shadow-md bg-green-500/10' : 'border-tg-secondary'}
      `}
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

        <div className="flex-shrink-0 flex items-end mt-1">
            {!hasPrice ? (
                 <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-tg-secondary text-tg-hint cursor-not-allowed">
                    <ShoppingCart className="w-5 h-5" />
                 </div>
            ) : count > 0 ? (
                <div className="flex items-center bg-green-500 rounded-lg overflow-hidden shadow-md">
                    <button 
                        onClick={handleDecrement}
                        className="w-8 h-8 flex items-center justify-center text-white active:bg-black/20 transition-colors"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <input 
                        type="number"
                        value={count}
                        onChange={handleManualInput}
                        onClick={handleInputClick}
                        className="w-10 h-8 bg-green-500 text-white text-center text-sm font-bold focus:outline-none border-x border-black/10 appearance-none m-0 p-0"
                    />
                    <button 
                        onClick={handleIncrement}
                        className="w-8 h-8 flex items-center justify-center text-white active:bg-black/20 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleAddToCart}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-tg-button text-tg-buttonText transition-all active:opacity-80 shadow-sm"
                >
                    <ShoppingCart className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
