'use client';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  count?: number;
  itemName?: string;
  processing?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '确认删除',
  message,
  count = 1,
  itemName = '条记录',
  processing = false
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const defaultMessage = count > 1 
    ? `确定要删除选中的 ${count} ${itemName}吗？`
    : `确定要删除该${itemName}吗？`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl transform animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🗑️</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-400 mb-2 text-lg">
            {message || defaultMessage}
          </p>
          {count > 0 && (
            <p className="text-sm text-gray-500 mb-6">
              此操作不可恢复，请谨慎操作
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              disabled={processing}
              className="px-6 py-3 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all font-medium disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              disabled={processing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all font-medium shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  删除中...
                </>
              ) : (
                <>确认删除</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
