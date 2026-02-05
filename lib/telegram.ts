type HapticStyle = "light" | "medium" | "heavy" | "rigid" | "soft";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        HapticFeedback?: {
          impactOccurred?: (style: HapticStyle) => void;
          notificationOccurred?: (type: "success" | "warning" | "error") => void;
        };
      };
    };
  }
}

export const telegram = {
  isAvailable() {
    return typeof window !== "undefined" && Boolean(window.Telegram?.WebApp);
  },
  ready() {
    window.Telegram?.WebApp?.ready?.();
  },
  expand() {
    window.Telegram?.WebApp?.expand?.();
  },
  setColors(background: string, header: string) {
    window.Telegram?.WebApp?.setBackgroundColor?.(background);
    window.Telegram?.WebApp?.setHeaderColor?.(header);
  },
  haptic(style: HapticStyle = "light") {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(style);
  },
  notify(type: "success" | "warning" | "error") {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(type);
  },
};
