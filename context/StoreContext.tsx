
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { ApiService } from '../services/api';
import { AuthStatus, CartItem, NomenclatureItem, PriceVariant } from '../types';

interface StoreContextType {
  authStatus: AuthStatus;
  checkAuth: () => Promise<boolean>;
  processAuthError: (error: any) => void;
  cart: CartItem[];
  addToCart: (item: NomenclatureItem, variant: PriceVariant) => void;
  removeFromCart: (id: string) => void;
  updateCartItemCount: (id: string, delta: number) => void;
  setCartItemCount: (id: string, count: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.LOADING);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Auth Check Logic
  const checkAuth = async (): Promise<boolean> => {
    try {
      await ApiService.authenticate();
      setAuthStatus(AuthStatus.AUTHORIZED);
      return true;
    } catch (error: any) {
      console.error("Auth check failed:", error);
      processAuthError(error);
      return false;
    }
  };

  // Global Error Handler for Auth Codes
  const processAuthError = (error: any) => {
    if (error.code === 101) {
      setAuthStatus(AuthStatus.REGISTER_NEED);
    } else if (error.code === 102) {
      setAuthStatus(AuthStatus.MODERATION_NEED);
    } else {
      // Generic error means we are just unauthorized, but we don't block the catalog.
      setAuthStatus(AuthStatus.UNAUTHORIZED);
    }
  };

  // Cart Logic
  const addToCart = (item: NomenclatureItem, variant: PriceVariant) => {
    const charRef = variant.ref || "";
    const itemId = `${item.ref}_${charRef}`;

    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (existing) {
        return prev.map(c => c.id === itemId ? { ...c, count: c.count + 1 } : c);
      }
      return [...prev, {
        id: itemId,
        productRef: item.ref,
        productName: item.name,
        charRef: charRef,
        charName: variant.name || "Стандарт",
        price: variant.price,
        count: 1
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartItemCount = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newCount = item.count + delta;
          return { ...item, count: newCount };
        }
        return item;
      }).filter(item => item.count > 0); // Auto-remove if count <= 0
    });
  };

  const setCartItemCount = (id: string, count: number) => {
    if (count <= 0) {
        removeFromCart(id);
        return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, count } : item));
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.count), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.count, 0), [cart]);

  return (
    <StoreContext.Provider value={{
      authStatus,
      checkAuth,
      processAuthError,
      cart,
      addToCart,
      removeFromCart,
      updateCartItemCount,
      setCartItemCount,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
