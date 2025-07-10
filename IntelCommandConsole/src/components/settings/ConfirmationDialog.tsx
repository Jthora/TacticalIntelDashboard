import React, { useCallback } from 'react';
import './ConfirmationDialog.css';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog for destructive or important actions in settings
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = React.memo(({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel
}) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }, [onCancel]);
  
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);
  
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (!isOpen) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'info':
        return 'ℹ️';
      default:
        return '⚡';
    }
  };

  return (
    <div className="confirmation-overlay" onClick={handleBackdropClick}>
      <div className={`confirmation-dialog ${type}`}>
        <div className="dialog-header">
          <span className="dialog-icon">{getIcon()}</span>
          <h3 className="dialog-title">{title}</h3>
        </div>
        
        <div className="dialog-content">
          <p className="dialog-message">{message}</p>
        </div>
        
        <div className="dialog-actions">
          <button 
            className="cancel-button"
            onClick={handleCancel}
            autoFocus
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-button ${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ConfirmationDialog;
