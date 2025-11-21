
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { CatalogView } from './pages/CatalogView';
import { ProductDetailView } from './pages/ProductDetailView';
import { FolderItem, NomenclatureItem, AuthStatus } from './types';
import { ArrowLeft, ChevronRight, Loader2, ShoppingCart } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { RegistrationForm } from './components/RegistrationForm';
import { CartDrawer } from './components/CartDrawer';

// Define types for navigation stack
type ScreenType = 'CATALOG' | 'DETAIL';

interface NavState {
  type: ScreenType;
  id: string; // Unique ID for key
  payload?: any;
}

// Inner App component to use Store Context
const MainApp = () => {
  const { tg, showBackButton, hideBackButton, onBackButtonClick } = useTelegram();
  const { authStatus, checkAuth, cartCount } = useStore();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initial State: Root Catalog
  const [stack, setStack] = useState<NavState[]>([
    { type: 'CATALOG', id: 'root', payload: { parentRef: null, name: 'Каталог' } }
  ]);

  // Initial Auth Check
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle Telegram Back Button Visibility
  useEffect(() => {
    if (stack.length > 1) {
      showBackButton();
    } else {
      hideBackButton();
    }
  }, [stack, showBackButton, hideBackButton]);

  // Auto-scroll breadcrumbs
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [stack]);

  // Handle Back Navigation
  const handleBack = useCallback(() => {
    if (stack.length > 1) {
      setStack(prev => prev.slice(0, -1));
    }
  }, [stack]);

  const handleJumpToHistory = (index: number) => {
    if (index < stack.length - 1) {
      setStack(prev => prev.slice(0, index + 1));
    }
  };

  useEffect(() => {
    const cleanup = onBackButtonClick(() => {
      handleBack();
    });
    return () => {
      cleanup();
    };
  }, [handleBack, onBackButtonClick]);

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

  // --- Render based on Auth Status ---

  // Note: We no longer block for LOADING or UNAUTHORIZED. 
  // The catalog should be accessible even if auth fails.
  // We only block for explicit interaction steps like Registration or Moderation.

  if (authStatus === AuthStatus.REGISTER_NEED) {
    return <RegistrationForm onSuccess={checkAuth} />;
  }

  if (authStatus === AuthStatus.MODERATION_NEED) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-tg-bg text-tg-text p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-tg-secondary flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-tg-button animate-spin" />
        </div>
        <h2 className="text-xl font-bold mb-2">Аккаунт на модерации</h2>
        <p className="text-tg-hint">Пожалуйста, ожидайте подтверждения вашей учетной записи администратором.</p>
      </div>
    );
  }

  // --- Main App Interface (Authorized or Guest) ---
  const currentScreen = stack[stack.length - 1];

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text font-sans">
      {/* Header with Breadcrumbs */}
      <header className="sticky top-0 z-30 bg-tg-bg/95 backdrop-blur-sm border-b border-tg-secondary px-4 h-14 flex items-center shadow-sm transition-colors">
        {stack.length > 1 && (
          <button 
            onClick={handleBack}
            className="mr-2 p-1 -ml-2 rounded-full hover:bg-tg-secondary text-tg-button flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex items-center overflow-x-auto no-scrollbar h-full mask-linear-fade mr-2"
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

        {/* Floating Cart Trigger (Header) */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-tg-button hover:bg-tg-secondary rounded-full transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </header>

      <main className="p-4">
        {currentScreen.type === 'CATALOG' && (
          <CatalogView 
            key={currentScreen.id}
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

      {/* Cart Overlay */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

// Root Wrapper
function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}

export default App;
