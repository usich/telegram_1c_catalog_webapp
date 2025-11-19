import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { CatalogView } from './pages/CatalogView';
import { ProductDetailView } from './pages/ProductDetailView';
import { FolderItem, NomenclatureItem } from './types';
import { ArrowLeft, ChevronRight } from 'lucide-react';

// Define types for navigation stack
type ScreenType = 'CATALOG' | 'DETAIL';

interface NavState {
  type: ScreenType;
  id: string; // Unique ID for key
  payload?: any;
}

function App() {
  const { tg, showBackButton, hideBackButton, onBackButtonClick } = useTelegram();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initial State: Root Catalog
  const [stack, setStack] = useState<NavState[]>([
    { type: 'CATALOG', id: 'root', payload: { parentRef: null, name: 'Каталог' } }
  ]);

  const currentScreen = stack[stack.length - 1];

  // Handle Telegram Back Button Visibility
  useEffect(() => {
    if (stack.length > 1) {
      showBackButton();
    } else {
      hideBackButton();
    }
  }, [stack, showBackButton, hideBackButton]);

  // Auto-scroll breadcrumbs to the right when stack changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [stack]);

  // Handle Back Navigation Logic
  const handleBack = useCallback(() => {
    if (stack.length > 1) {
      setStack(prev => prev.slice(0, -1));
    }
  }, [stack]);

  // Handle Jumping to a specific point in history via breadcrumbs
  const handleJumpToHistory = (index: number) => {
    if (index < stack.length - 1) {
      setStack(prev => prev.slice(0, index + 1));
    }
  };

  // Register Telegram Back Button Callback
  useEffect(() => {
    const cleanup = onBackButtonClick(() => {
      handleBack();
    });
    return () => {
      cleanup();
    };
  }, [handleBack, onBackButtonClick]);

  // Navigation Handlers
  const navigateToFolder = (folder: FolderItem) => {
    setStack(prev => [...prev, { 
      type: 'CATALOG', 
      id: folder.ref, 
      payload: { parentRef: folder.ref, name: folder.name } 
    }]);
  };

  const navigateToProduct = (product: NomenclatureItem) => {
    setStack(prev => [...prev, {
      type: 'DETAIL',
      id: product.ref,
      payload: { productRef: product.ref, name: product.name }
    }]);
  };

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text font-sans">
      {/* Header with Breadcrumbs */}
      <header className="sticky top-0 z-50 bg-tg-bg/95 backdrop-blur-sm border-b border-tg-secondary px-4 h-14 flex items-center shadow-sm transition-colors">
        {stack.length > 1 && (
           // Fallback back button if Telegram native one fails or for testing in browser
          <button 
            onClick={handleBack}
            className="mr-2 p-1 -ml-2 rounded-full hover:bg-tg-secondary text-tg-button flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        {/* Breadcrumb Navigation */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex items-center overflow-x-auto no-scrollbar h-full mask-linear-fade"
        >
          {stack.map((screen, index) => {
            const isLast = index === stack.length - 1;
            return (
              <React.Fragment key={screen.id}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-tg-hint mx-1 flex-shrink-0" />
                )}
                <button
                  onClick={() => handleJumpToHistory(index)}
                  disabled={isLast}
                  className={`
                    whitespace-nowrap text-sm md:text-base transition-colors flex-shrink-0 py-1
                    ${isLast 
                      ? 'font-bold text-tg-text cursor-default' 
                      : 'text-tg-hint hover:text-tg-button active:text-tg-button cursor-pointer'}
                  `}
                >
                  {screen.payload.name}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </header>

      <main className="p-4">
        {currentScreen.type === 'CATALOG' && (
          <CatalogView 
            key={currentScreen.id} // Key forces remount/reset when switching folders if needed, or keeps state if unique
            parentRef={currentScreen.payload.parentRef}
            onNavigateFolder={navigateToFolder}
            onNavigateProduct={navigateToProduct}
          />
        )}
        
        {currentScreen.type === 'DETAIL' && (
          <ProductDetailView 
            key={currentScreen.id}
            productRef={currentScreen.payload.productRef}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
}

export default App;