import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onClear?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClear }) => {
  if (!error) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#fed7d7',
      border: '2px solid #f56565',
      borderRadius: '8px',
      padding: '16px',
      color: '#742a2a',
      maxWidth: '400px',
      zIndex: 1000,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Error</h4>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{error}</p>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            style={{
              background: 'none',
              border: 'none',
              color: '#742a2a',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              marginLeft: '12px'
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay; 