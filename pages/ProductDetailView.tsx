
import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { NomenclatureDetailResponse } from '../types';
import { PriceSelector } from '../components/PriceSelector';
import { Loader2, ShoppingCart, ImageOff, Plus, Minus } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface Props {
  productRef: string;
  onBack: () => void;
}

export const ProductDetailView: React.FC<Props> = ({ productRef }) => {
  const { addToCart, cart, updateCartItemCount, setCartItemCount } = useStore();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<NomenclatureDetailResponse | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setImageError(false);
      try {
        const data = await ApiService.getNomenclatureDetail(productRef);
        setDetail(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productRef]);

  // Calculate Cart State for Current Selection
  const hasPrice = detail?.price && detail.price.length > 0;
  
  const currentVariant = detail?.price?.find(p => p.price === currentPrice) || (detail?.price ? detail.price[0] : null);
  const charRef = currentVariant?.ref || "";
  const cartItemId = detail ? `${detail.ref}_${charRef}` : "";
  
  const cartItem = cart.find(c => c.id === cartItemId);
  const count = cartItem ? cartItem.count : 0;

  const handleAdd = () => {
    if (detail && currentVariant) {
      addToCart({
        ref: detail.ref,
        name: detail.name,
        parent: detail.parent,
        price: detail.price
      }, currentVariant);
    }
  };

  const handleIncrement = () => {
    if (cartItemId) updateCartItemCount(cartItemId, 1);
  };

  const handleDecrement = () => {
    if (cartItemId) updateCartItemCount(cartItemId, -1);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && cartItemId) {
        setCartItemCount(cartItemId, val);
    } else if (e.target.value === '' && cartItemId) {
        setCartItemCount(cartItemId, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-tg-button">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!detail) {
    return <div className="text-center p-10 text-tg-hint">Товар не найден.</div>;
  }

  // Safe map with optional chaining in case price array is missing
  const priceOptions = detail.price?.map(p => ({
    label: p.name ? p.name : "Стандарт",
    price: p.price
  })) || [];

  return (
    <div className="bg-tg-bg min-h-screen flex flex-col pb-24 animate-in fade-in duration-300">
      {/* Image */}
      <div className="w-full h-96 bg-tg-secondary relative flex items-center justify-center overflow-hidden">
        {!imageError ? (
          <img 
            src={ApiService.getImageUrl(detail.ref)} 
            alt={detail.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-tg-hint select-none">
            <ImageOff className="w-16 h-16 mb-3 opacity-30" strokeWidth={1.5} />
            <span className="text-lg font-medium opacity-50">Изображения пока нет</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">
        {/* Article */}
        {detail.article && (
          <span className="text-sm text-tg-hint uppercase tracking-wider font-mono">
            Артикул: {detail.article}
          </span>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-tg-text leading-tight">
          {detail.name}
        </h1>

        {/* Price & Characteristics */}
        <div className="py-2 border-b border-tg-secondary mb-2">
          {hasPrice ? (
            <PriceSelector 
              options={priceOptions} 
              onPriceChange={setCurrentPrice} 
              variant="detail" 
            />
          ) : (
            <div className="text-red-500 font-medium">Нет в наличии</div>
          )}
        </div>

        {/* Description */}
        <div className="prose prose-sm text-tg-text max-w-none">
          <h3 className="text-lg font-semibold mb-1">Описание</h3>
          <p className="opacity-90 whitespace-pre-line leading-relaxed">
            {detail.description || "Описание отсутствует."}
          </p>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-tg-bg border-t border-tg-secondary/20 shadow-lg backdrop-blur-md bg-opacity-95 z-20">
        {!hasPrice ? (
          <button
            disabled
            className="w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center shadow-md bg-tg-secondary text-tg-hint cursor-not-allowed"
          >
            Недоступно
          </button>
        ) : count > 0 ? (
          <div className="w-full h-14 flex gap-3">
             {/* Left Block - 75% */}
             <div className="flex-[3] bg-green-500 text-white rounded-xl font-bold text-lg flex items-center justify-center shadow-md select-none">
                В корзине
             </div>
             
             {/* Right Block - 25% */}
             <div className="flex-[1] bg-tg-button text-tg-buttonText rounded-xl shadow-md overflow-hidden flex items-center justify-between px-1">
                <button 
                    onClick={handleDecrement} 
                    className="h-full px-1 flex items-center justify-center active:bg-black/20 transition-colors"
                >
                    <Minus className="w-5 h-5" />
                </button>
                <input 
                    type="number"
                    value={count}
                    onChange={handleManualInput}
                    className="w-full bg-transparent text-center font-bold text-lg focus:outline-none appearance-none text-tg-buttonText m-0 p-0 min-w-0"
                />
                <button 
                    onClick={handleIncrement} 
                    className="h-full px-1 flex items-center justify-center active:bg-black/20 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
             </div>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center shadow-md transition-all active:scale-95 bg-tg-button text-tg-buttonText hover:brightness-110"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            В корзину
          </button>
        )}
      </div>
    </div>
  );
};
