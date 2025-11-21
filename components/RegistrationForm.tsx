
import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { RegisterRequest } from '../types';
import { Loader2 } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export const RegistrationForm: React.FC<Props> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<RegisterRequest>({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone_number: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple Phone Mask for +7 (XXX) XXX-XX-XX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('7')) val = val.substring(1); // Strip leading 7
    val = val.substring(0, 10); // Limit length

    let formatted = '';
    if (val.length > 0) formatted += '+7 (' + val.substring(0, 3);
    if (val.length >= 4) formatted += ') ' + val.substring(3, 6);
    if (val.length >= 7) formatted += '-' + val.substring(6, 8);
    if (val.length >= 9) formatted += '-' + val.substring(8, 10);

    setFormData(prev => ({ ...prev, phone_number: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    const cleanPhone = formData.phone_number.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      setError("Введите корректный номер телефона");
      return;
    }
    if (!formData.first_name || !formData.last_name) {
      setError("Заполните обязательные поля");
      return;
    }

    setLoading(true);
    try {
      await ApiService.register(formData);
      onSuccess();
    } catch (err: any) {
        if (err.code === 102) {
            // Needed moderation
            onSuccess(); // Parent will reload and catch status 102
        } else {
            setError(err.message || "Ошибка регистрации");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-tg-bg min-h-screen flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-tg-text mb-6 text-center">Регистрация</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-tg-hint mb-1">Фамилия *</label>
          <input 
            type="text"
            required
            value={formData.last_name}
            onChange={e => setFormData({...formData, last_name: e.target.value})}
            className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text border border-transparent focus:border-tg-button outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-tg-hint mb-1">Имя *</label>
          <input 
            type="text"
            required
            value={formData.first_name}
            onChange={e => setFormData({...formData, first_name: e.target.value})}
            className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text border border-transparent focus:border-tg-button outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-tg-hint mb-1">Отчество</label>
          <input 
            type="text"
            value={formData.middle_name}
            onChange={e => setFormData({...formData, middle_name: e.target.value})}
            className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text border border-transparent focus:border-tg-button outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-tg-hint mb-1">Телефон *</label>
          <input 
            type="tel"
            required
            value={formData.phone_number}
            onChange={handlePhoneChange}
            placeholder="+7 (___) ___-__-__"
            className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text border border-transparent focus:border-tg-button outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-tg-hint mb-1">Email</label>
          <input 
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text border border-transparent focus:border-tg-button outline-none"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 mt-4 bg-tg-button text-tg-buttonText rounded-xl font-bold shadow-md active:scale-[0.98] transition-transform flex justify-center items-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Зарегистрироваться"}
        </button>
      </form>
    </div>
  );
};
