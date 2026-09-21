import { useState, useCallback } from "react";

export interface UseConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDangerous: false,
    resolvePromise: null as ((value: boolean) => void) | null,
  });

  const confirm = useCallback(
    (options: UseConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState((prev) => ({
          ...prev,
          isOpen: true,
          title: options.title,
          message: options.message,
          confirmText: options.confirmText || "Confirm",
          cancelText: options.cancelText || "Cancel",
          isDangerous: options.isDangerous || false,
          resolvePromise: resolve,
        }));
      });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (confirmState.resolvePromise) {
      confirmState.resolvePromise(true);
    }
    setConfirmState((prev) => ({
      ...prev,
      isOpen: false,
      resolvePromise: null,
    }));
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolvePromise) {
      confirmState.resolvePromise(false);
    }
    setConfirmState((prev) => ({
      ...prev,
      isOpen: false,
      resolvePromise: null,
    }));
  }, [confirmState]);

  return {
    confirm,
    state: {
      isOpen: confirmState.isOpen,
      title: confirmState.title,
      message: confirmState.message,
      confirmText: confirmState.confirmText,
      cancelText: confirmState.cancelText,
      isDangerous: confirmState.isDangerous,
    },
    handleConfirm,
    handleCancel,
  };
}
