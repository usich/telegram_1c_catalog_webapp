import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        ready: () => void;
        expand: () => void;
        close: () => void;
        isVersionAtLeast: (version: string) => boolean;
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
      };
    };
  }
}

export const useTelegram = () => {
  const [tg] = useState(window.Telegram?.WebApp);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      setColorScheme(tg.colorScheme);
    }
  }, [tg]);

  // BackButton was introduced in version 6.1
  const isBackButtonSupported = tg?.isVersionAtLeast ? tg.isVersionAtLeast('6.1') : false;

  const showBackButton = () => {
    if (isBackButtonSupported) {
      tg?.BackButton?.show();
    }
  };

  const hideBackButton = () => {
    if (isBackButtonSupported) {
      tg?.BackButton?.hide();
    }
  };
  
  const onBackButtonClick = (callback: () => void) => {
    if (isBackButtonSupported) {
      tg?.BackButton?.onClick(callback);
      return () => tg?.BackButton?.offClick(callback);
    }
    return () => {}; // No-op cleanup
  };

  return {
    tg,
    colorScheme,
    isBackButtonSupported,
    showBackButton,
    hideBackButton,
    onBackButtonClick,
  };
};