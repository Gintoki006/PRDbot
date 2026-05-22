"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
    warning: (msg) => addToast(msg, "warning"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  );
}

const TOAST_STYLES = {
  success: { bg: "bg-green-500/15", border: "border-green-500/40", text: "text-green-400", icon: "check_circle" },
  error: { bg: "bg-red-500/15", border: "border-red-500/40", text: "text-red-400", icon: "error" },
  info: { bg: "bg-blue-500/15", border: "border-blue-500/40", text: "text-blue-400", icon: "info" },
  warning: { bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-400", icon: "warning" },
};

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 p-3 rounded-xl border backdrop-blur-md shadow-2xl ${style.bg} ${style.border} animate-in slide-in-from-right-5 fade-in duration-300`}
          >
            <span className={`material-symbols-outlined text-[18px] mt-0.5 flex-none ${style.text}`}>
              {style.icon}
            </span>
            <p className={`text-sm flex-1 ${style.text}`}>{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gh-text-secondary hover:text-white transition-colors flex-none"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
