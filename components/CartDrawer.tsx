
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, CheckCircle, Loader2, AlertCircle, Info, MapPin, Truck } from 'lucide-react';
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

  const dismissKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleCheckout = async () => {
    dismissKeyboard();
    setError(null);
    
    if (deliveryType === 'delivery' && !address.trim()) {
      setError("Пожалуйста, укажите адрес доставки");
      return;
    }

    setIsSubmitting(true);

    try {
      if (authStatus !== AuthStatus.AUTHORIZED) {
        const authorized = await checkAuth();
        if (!authorized) {
          setError("Не удалось авторизоваться.");
          setIsSubmitting(false);
          return;
        }
      }

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
    onClose();
    processAuthError({ code: 101 });
  };

  const handleClose = () => {
    dismissKeyboard();
    onClose();
  };

  if (!isOpen) return null;

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
      >
        
        {/* Fixed Header */}
        <div 
            className="p-4 border-b border-tg-secondary flex items-center justify-between flex-shrink-0 z-10 bg-tg-bg"
            onClick={dismissKeyboard}
        >
          <h2 className="text-xl font-bold text-tg-text">Корзина {cart.length > 0 && `(${cart.length})`}</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-tg-secondary text-tg-hint">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Container containing everything */}
        <div 
            className="flex-1 overflow-y-auto touch-pan-y no-scrollbar pb-safe"
            onClick={(e) => {
                if (e.target === e.currentTarget) dismissKeyboard();
            }}
        >
          {/* Items Section */}
          <div className="p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-tg-hint opacity-60">
                <Trash2 className="w-12 h-12 mb-2" />
                <p>Корзина пуста</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-3 bg-tg-secondary/40 p-3 rounded-xl border border-tg-secondary/30">
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-tg-text leading-tight">{item.productName}</h4>
                      {item.charName !== "Стандарт" && <p className="text-[11px] text-tg-hint mt-0.5">{item.charName}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-tg-text text-sm">{(item.price * item.count).toLocaleString()} ₽</div>
                      <div className="flex items-center bg-tg-bg rounded-lg border border-tg-secondary scale-90 origin-right">
                        <button onClick={() => updateCartItemCount(item.id, -1)} className="p-1.5 text-tg-button"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="px-2 text-xs font-bold min-w-[1.2rem] text-center">{item.count}</span>
                        <button onClick={() => updateCartItemCount(item.id, 1)} className="p-1.5 text-tg-button"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="self-start text-tg-hint hover:text-red-500 p-1"><X className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>

          {/* Delivery & Options Section - IN FLOW */}
          {cart.length > 0 && (
            <div className="px-4 pb-8 space-y-6">
              
              {/* Delivery Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-tg-hint uppercase tracking-widest px-1">Получение</label>
                <div className="flex bg-tg-secondary rounded-xl p-1 shadow-inner">
                  <button
                    onClick={() => { dismissKeyboard(); setDeliveryType('pickup'); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      deliveryType === 'pickup' ? 'bg-tg-button text-tg-buttonText shadow-sm' : 'text-tg-hint'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" /> Самовывоз
                  </button>
                  <button
                    onClick={() => { dismissKeyboard(); setDeliveryType('delivery'); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      deliveryType === 'delivery' ? 'bg-tg-button text-tg-buttonText shadow-sm' : 'text-tg-hint'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" /> Доставка
                  </button>
                </div>
              </div>

              {/* Address Input */}
              {deliveryType === 'delivery' && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-[10px] font-bold text-tg-hint uppercase tracking-widest mb-1.5 px-1">Адрес доставки *</label>
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                    className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text text-sm resize-none h-20 focus:outline-none border border-transparent focus:border-tg-button/30 transition-all"
                    placeholder="Город, улица, дом..."
                  />
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="block text-[10px] font-bold text-tg-hint uppercase tracking-widest mb-1.5 px-1">Комментарий</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                  className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text text-sm resize-none h-16 focus:outline-none border border-transparent focus:border-tg-button/30 transition-all"
                  placeholder="Доп. информация..."
                />
              </div>

              {/* Order Summary & Button - NOW IN SCROLL FLOW */}
              <div className="pt-2 border-t border-tg-secondary/50 space-y-4">
                <div className="flex items-center justify-between px-1" onClick={dismissKeyboard}>
                  <span className="text-tg-hint text-sm font-medium">Итого к оплате</span>
                  <span className="text-xl font-black text-tg-text tracking-tight">{cartTotal.toLocaleString()} ₽</span>
                </div>

                {error && <div className="text-red-500 text-[11px] text-center font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</div>}

                <button 
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-tg-button text-tg-buttonText rounded-xl font-bold text-lg shadow-lg active:scale-[0.97] transition-all flex justify-center items-center gap-2 mb-10"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Оформить заказ"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      {showRegisterModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-tg-bg p-6 rounded-2xl shadow-2xl max-w-xs w-full border border-tg-secondary">
            <div className="flex justify-center mb-4 text-tg-button"><AlertCircle className="w-12 h-12" /></div>
            <h3 className="text-lg font-bold text-center text-tg-text mb-2">Регистрация</h3>
            <p className="text-center text-tg-hint mb-6 text-sm">Чтобы сделать заказ, нужно заполнить профиль.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRegisterModal(false)} className="flex-1 py-2 rounded-xl border border-tg-hint text-tg-text text-sm">Отмена</button>
              <button onClick={handleRegisterConfirm} className="flex-1 py-2 rounded-xl bg-tg-button text-tg-buttonText font-bold text-sm">Ок</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
