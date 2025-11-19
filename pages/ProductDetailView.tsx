
import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { NomenclatureDetailResponse } from '../types';
import { PriceSelector } from '../components/PriceSelector';
import { Loader2, ShoppingCart } from 'lucide-react';

interface Props {
  productRef: string;
  onBack: () => void;
}

export const ProductDetailView: React.FC<Props> = ({ productRef }) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<NomenclatureDetailResponse | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
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

  const hasPrice = detail.price && detail.price.length > 0;

  // Map API 'name' field to component 'label' field
  // Use 'name' as label, fallback to "Стандарт" if empty
  const priceOptions = detail.price.map(p => ({
    label: p.name ? p.name : "Стандарт",
    price: p.price
  }));

  return (
    <div className="bg-tg-bg min-h-screen flex flex-col pb-24 animate-in fade-in duration-300">
      {/* Image */}
      <div className="w-full h-96 bg-tg-secondary relative">
        <img 
          src={ApiService.getImageUrl(detail.ref)} 
          alt={detail.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/400?grayscale'; }}
        />
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-tg-bg border-t border-tg-secondary/20 shadow-lg backdrop-blur-md bg-opacity-95">
        <button
          disabled={!hasPrice}
          onClick={() => console.log('Add to cart', detail.ref, currentPrice)}
          className={`
            w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center shadow-md transition-transform active:scale-95
            ${hasPrice 
              ? 'bg-tg-button text-tg-buttonText hover:brightness-110' 
              : 'bg-tg-secondary text-tg-hint cursor-not-allowed'}
          `}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {hasPrice ? `В корзину` : 'Недоступно'}
        </button>
      </div>
    </div>
  );
};
