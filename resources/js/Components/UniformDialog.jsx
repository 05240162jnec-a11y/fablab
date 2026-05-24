import React, { useEffect } from 'react';

/**
 * UniformDialog
 * 
 * Tailwind-styled modal replacing browser-native alert/confirm/prompt.
 *
 * Props:
 * - open: boolean
 * - variant: 'alert' | 'confirm' | 'prompt'
 * - title: string
 * - message: string
 * - confirmText: string
 * - cancelText: string
 * - placeholder: string
 * - defaultValue: string
 * - onClose: () => void
 * - onConfirm: (value?: string) => void
 */
export default function UniformDialog({
  open,
  variant = 'alert',
  title = '',
  message = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  placeholder = '',
  defaultValue = '',
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isPrompt = variant === 'prompt';
  const isConfirm = variant === 'confirm';
  const isAlert = variant === 'alert';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {title || (isAlert ? 'Message' : isConfirm ? 'Please confirm' : 'Input required')}
              </h3>
              {message ? (
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                  {message}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className="shrink-0 w-9 h-9 rounded-xl hover:bg-gray-100 text-gray-500"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          {isPrompt ? (
            <PromptBody
              placeholder={placeholder}
              defaultValue={defaultValue}
              onConfirm={onConfirm}
              confirmText={confirmText}
              onClose={onClose}
              cancelText={cancelText}
            />
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
              {isConfirm ? (
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  {cancelText}
                </button>
              ) : null}

              <button
                type="button"
                className={
                  isAlert
                    ? 'px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700'
                    : 'px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700'
                }
                onClick={() => onConfirm?.()}
              >
                {confirmText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PromptBody({
  placeholder,
  defaultValue,
  onConfirm,
  confirmText,
  onClose,
  cancelText,
}) {
  const [value, setValue] = React.useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="flex flex-col gap-3">
      <input
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
        <button
          type="button"
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          {cancelText}
        </button>

        <button
          type="button"
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={() => onConfirm?.(value)}
          disabled={value === null || value === undefined}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

