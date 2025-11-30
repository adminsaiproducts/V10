import React from 'react';

interface ErrorBannerProps {
  message: string;
  onClose?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div style={{
      backgroundColor: '#fee2e2',
      border: '1px solid #ef4444',
      color: '#b91c1c',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      textAlign: 'left'
    }}>
      <span><strong>Error:</strong> {message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#b91c1c',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 5px',
            marginLeft: '10px'
          }}
          aria-label="Close error"
        >
          &times;
        </button>
      )}
    </div>
  );
};