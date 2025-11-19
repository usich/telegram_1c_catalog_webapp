import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { FolderItem as IFolderItem, NomenclatureItem, NomenclatureListResponse } from '../types';
import { FolderItem } from '../components/FolderItem';
import { ProductCard } from '../components/ProductCard';
import { Loader2 } from 'lucide-react';

interface Props {
  parentRef: string | null;
  onNavigateFolder: (folder: IFolderItem) => void;
  onNavigateProduct: (product: NomenclatureItem) => void;
}

export const CatalogView: React.FC<Props> = ({ parentRef, onNavigateFolder, onNavigateProduct }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NomenclatureListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pass undefined if null to match optional param signature
        const res = await ApiService.getNomenclatureList(parentRef || undefined);
        if (isMounted) setData(res);
      } catch (err) {
        if (isMounted) setError("Не удалось загрузить каталог.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [parentRef]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-tg-button">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-tg-secondary rounded-md text-tg-text"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (!data) return null;

  const isEmpty = data.parent.length === 0 && data.nomenclature.length === 0;

  return (
    <div className="pb-20">
      {isEmpty && (
        <div className="text-center text-tg-hint py-10">
          В этой папке пока пусто.
        </div>
      )}

      {/* Folders First */}
      <div className="flex flex-col">
        {data.parent.map((folder) => (
          <FolderItem key={folder.ref} item={folder} onClick={onNavigateFolder} />
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {data.nomenclature.map((item) => (
          <ProductCard 
            key={item.ref} 
            item={item} 
            onClick={onNavigateProduct}
            onAddToCart={(i, price) => console.log(`Add to cart: ${i.name} - ${price}`)}
          />
        ))}
      </div>
    </div>
  );
};