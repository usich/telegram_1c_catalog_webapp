
import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, CheckCircle, Loader2, AlertCircle, Info, MapPin, Truck, Keyboard } from 'lucide-react';
import { ApiService } from '../services/api';
import { AuthStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartItemCount, clearCart, cartTotal, authStatus, checkAuth, processAuthError } = useStore();
  const [comment, setComment] = useState("");
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);

  // Ref to track scroll container for keyboard dismissal
  const scrollRef = useRef<HTMLDivElement>(null);

  const dismissKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleCheckout = async () => {
    // Immediate keyboard dismissal to prevent UI jumping during submission
    dismissKeyboard();
    setError(null);
    
    // Validation
    if (deliveryType === 'delivery' && !address.trim()) {
      setError("Пожалуйста, укажите адрес доставки");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Lazy Auth Check
      if (authStatus !== AuthStatus.AUTHORIZED) {
        const authorized = await checkAuth();
        if (!authorized) {
          setError("Не удалось авторизоваться. Проверьте соединение.");
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Create Order
      const orderItems = cart.map(item => ({
        nomenclature: item.productRef,
        characteristic: item.charRef,
        count: item.count,
        price: item.price
      }));

      await ApiService.createOrder({
        items: orderItems,
        comment,
        delivery: {
          type: deliveryType,
          address: deliveryType === 'delivery' ? address : ""
        }
      });

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        setSuccess(false);
        setComment("");
        setAddress("");
        setDeliveryType('pickup');
        onClose();
      }, 2500);

    } catch (err: any) {
      // Handle specific auth errors via local modals
      if (err.code === 101) {
        setShowRegisterModal(true);
      } else if (err.code === 102) {
        setShowModerationModal(true);
      } else {
        setError(err.message || "Ошибка оформления заказа");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterConfirm = () => {
    setShowRegisterModal(false);
    onClose(); // Close cart
    processAuthError({ code: 101 }); // Trigger global registration view
  };

  // Close drawer and keyboard
  const handleClose = () => {
    dismissKeyboard();
    onClose();
  };

  // Keyboard dismissal on scroll start (native-like behavior)
  const handleScroll = () => {
    dismissKeyboard();
  };

  if (!isOpen) return null;

  // Success Animation View
  if (success) {
    return (
      <div className="fixed inset-0 z-[60] bg-tg-bg flex flex-col items-center justify-center animate-in fade-in">
        <div className="transform scale-110 transition-transform duration-500">
          <CheckCircle className="w-24 h-24 text-green-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold mt-6 text-tg-text">Заказ оформлен!</h2>
        <p className="text-tg-hint mt-2">Менеджер свяжется с вами.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose} 
      />

      {/* Drawer Content */}
      <div 
        className="relative w-full max-w-md bg-tg-bg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden"
        onClick={(e) => {
            // If user clicks on the "empty" areas of the drawer, hide keyboard
            if (e.target === e.currentTarget) dismissKeyboard();
        }}
      >
        
        {/* Header */}
        <div 
            className="p-4 border-b border-tg-secondary flex items-center justify-between flex-shrink-0"
            onClick={dismissKeyboard}
        >
          <h2 className="text-xl font-bold text-tg-text">Корзина</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-tg-secondary text-tg-hint">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y"
        >
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-tg-hint opacity-60">
              <Trash2 className="w-12 h-12 mb-2" />
              <p>Корзина пуста</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 bg-tg-secondary/50 p-3 rounded-xl">
                
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-tg-text leading-tight">{item.productName}</h4>
                    <p className="text-xs text-tg-hint mt-1">{item.charName !== "Стандарт" ? item.charName : ""}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="font-bold text-tg-text">{(item.price * item.count).toLocaleString()} ₽</div>
                    
                    <div className="flex items-center bg-tg-bg rounded-lg border border-tg-secondary">
                      <button 
                        onClick={() => updateCartItemCount(item.id, -1)}
                        className="p-1 text-tg-button hover:bg-tg-secondary/50 rounded-l-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-2 text-sm font-medium min-w-[1.5rem] text-center">{item.count}</span>
                      <button 
                        onClick={() => updateCartItemCount(item.id, 1)}
                        className="p-1 text-tg-button hover:bg-tg-secondary/50 rounded-r-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="self-start text-tg-hint hover:text-red-500 p-1 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-tg-bg border-t border-tg-secondary space-y-4 pb-8 flex-shrink-0">
            
            {/* Delivery Selector */}
            <div className="flex bg-tg-secondary rounded-xl p-1" onClick={dismissKeyboard}>
              <button
                onClick={() => setDeliveryType('pickup')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  deliveryType === 'pickup' 
                    ? 'bg-tg-button text-tg-buttonText shadow-sm' 
                    : 'text-tg-hint hover:text-tg-text'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Самовывоз
              </button>
              <button
                onClick={() => setDeliveryType('delivery')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  deliveryType === 'delivery' 
                    ? 'bg-tg-button text-tg-buttonText shadow-sm' 
                    : 'text-tg-hint hover:text-tg-text'
                }`}
              >
                <Truck className="w-4 h-4" />
                Доставка
              </button>
            </div>

            {/* Address Input */}
            {deliveryType === 'delivery' && (
              <div className="animate-in slide-in-from-top-2 duration-200 relative">
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm text-tg-hint">Адрес доставки *</label>
                    <button onClick={dismissKeyboard} className="text-[10px] text-tg-button flex items-center gap-1 md:hidden">
                        <Keyboard className="w-3 h-3" /> Скрыть
                    </button>
                </div>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-tg-button transition-all"
                  placeholder="Улица, дом, квартира..."
                />
              </div>
            )}

            {/* Comment */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm text-tg-hint">Комментарий к заказу</label>
                <button onClick={dismissKeyboard} className="text-[10px] text-tg-button flex items-center gap-1 md:hidden">
                    <Keyboard className="w-3 h-3" /> Скрыть
                </button>
              </div>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text text-sm resize-none h-16 focus:outline-none focus:ring-1 focus:ring-tg-button"
                placeholder="Дополнительные пожелания..."
              />
            </div>

            <div className="flex items-center justify-between text-lg font-bold" onClick={dismissKeyboard}>
              <span>Итого:</span>
              <span>{cartTotal.toLocaleString()} ₽</span>
            </div>

            {error && <div className="text-red-500 text-sm text-center font-medium bg-red-500/10 p-2 rounded-lg">{error}</div>}

            <button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-3 bg-tg-button text-tg-buttonText rounded-xl font-bold text-lg shadow-md active:scale-[0.98] transition-transform flex justify-center items-center"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Оформить заказ"}
            </button>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Registration Needed Modal (Code 101) */}
      {showRegisterModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-tg-bg p-6 rounded-2xl shadow-2xl max-w-xs w-full border border-tg-secondary transform scale-100 transition-transform">
            <div className="flex justify-center mb-4 text-tg-button">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-center text-tg-text mb-2">Требуется регистрация</h3>
            <p className="text-center text-tg-hint mb-6 text-sm">
              Для того чтобы сделать заказ, необходимо зарегистрироваться.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="flex-1 py-2 rounded-xl border border-tg-hint text-tg-text font-medium hover:bg-tg-secondary transition-colors"
              >
                Нет
              </button>
              <button 
                onClick={handleRegisterConfirm}
                className="flex-1 py-2 rounded-xl bg-tg-button text-tg-buttonText font-bold hover:brightness-110 transition-all"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Needed Modal (Code 102) */}
      {showModerationModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-tg-bg p-6 rounded-2xl shadow-2xl max-w-xs w-full border border-tg-secondary transform scale-100 transition-transform">
            <div className="flex justify-center mb-4 text-yellow-500">
              <Info className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-center text-tg-text mb-2">Аккаунт на модерации</h3>
            <p className="text-center text-tg-hint mb-6 text-sm">
              Ваша учетная запись находится на модерации. Попробуйте позже.
            </p>
            <button 
              onClick={() => setShowModerationModal(false)}
              className="w-full py-2 rounded-xl bg-tg-secondary text-tg-text font-bold hover:bg-tg-hint/20 transition-colors"
            >
              Ок
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
