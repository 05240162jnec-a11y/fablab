import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import UniformDialog from './UniformDialog';

const DialogContext = createContext(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within UniformDialogManager');
  return ctx;
}

export default function UniformDialogManager({ children }) {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState('alert');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirmText, setConfirmText] = useState('OK');
  const [cancelText, setCancelText] = useState('Cancel');
  const [placeholder, setPlaceholder] = useState('');
  const [defaultValue, setDefaultValue] = useState('');

  const [resolver, setResolver] = useState(null);

  const close = useCallback(() => {
    setOpen(false);
    setResolver(null);
  }, []);

  const showAlert = useCallback(({ title: t, message: m, confirmText: cText } = {}) => {
    return new Promise((resolve) => {
      setVariant('alert');
      setTitle(t || 'Message');
      setMessage(m || '');
      setConfirmText(cText || 'OK');
      setCancelText('');
      setPlaceholder('');
      setDefaultValue('');
      setResolver(() => resolve);
      setOpen(true);
    });
  }, []);

  const showConfirm = useCallback(({ title: t, message: m, confirmText: cText, cancelText: canText } = {}) => {
    return new Promise((resolve) => {
      setVariant('confirm');
      setTitle(t || 'Confirm');
      setMessage(m || '');
      setConfirmText(cText || 'Yes');
      setCancelText(canText || 'No');
      setPlaceholder('');
      setDefaultValue('');
      setResolver(() => resolve);
      setOpen(true);
    });
  }, []);

  const showPrompt = useCallback(({ title: t, message: m, placeholder: ph, defaultValue: dv, confirmText: cText, cancelText: canText } = {}) => {
    return new Promise((resolve) => {
      setVariant('prompt');
      setTitle(t || 'Input');
      setMessage(m || '');
      setConfirmText(cText || 'OK');
      setCancelText(canText || 'Cancel');
      setPlaceholder(ph || '');
      setDefaultValue(dv || '');
      setResolver(() => resolve);
      setOpen(true);
    });
  }, []);

  const onConfirm = useCallback(
    (value) => {
      if (resolver) {
        if (variant === 'alert') resolver(true);
        else if (variant === 'confirm') resolver(true);
        else if (variant === 'prompt') resolver(value);
      }
      close();
    },
    [resolver, variant, close]
  );

  const onClose = useCallback(() => {
    if (resolver) {
      if (variant === 'alert') resolver(false);
      else if (variant === 'confirm') resolver(false);
      else if (variant === 'prompt') resolver(null);
    }
    close();
  }, [resolver, variant, close]);

  const api = useMemo(
    () => ({ showAlert, showConfirm, showPrompt }),
    [showAlert, showConfirm, showPrompt]
  );

  return (
    <DialogContext.Provider value={api}>
      {children}

      <UniformDialog
        open={open}
        variant={variant}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </DialogContext.Provider>
  );
}

