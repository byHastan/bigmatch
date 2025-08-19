import { useCallback, useState } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      addToast(message, "success");
    },
    [addToast]
  );

  const showError = useCallback(
    (message: string) => {
      addToast(message, "error");
    },
    [addToast]
  );

  return {
    toasts,
    showSuccess,
    showError,
    removeToast,
  };
}
