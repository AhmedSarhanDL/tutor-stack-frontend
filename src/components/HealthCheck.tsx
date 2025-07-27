import React, { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';

const HealthCheck: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<{
    loading: boolean;
    error: string | null;
    data: any | null;
  }>({
    loading: true,
    error: null,
    data: null
  });

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthStatus({ loading: true, error: null, data: null });
    
    try {
      console.log('HealthCheck: Testing API connectivity...');
      const response = await api.get('/health');
      console.log('HealthCheck: API response:', response.data);
      setHealthStatus({ loading: false, error: null, data: response.data });
    } catch (error: any) {
      console.error('HealthCheck: API error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
      setHealthStatus({ loading: false, error: errorMessage, data: null });
    }
  };

  if (healthStatus.loading) {
    return (
      <div style={{
        padding: '20px',
        margin: '20px',
        border: '2px solid #4299e1',
        borderRadius: '8px',
        backgroundColor: '#ebf8ff',
        color: '#2b6cb0'
      }}>
        <h3>Testing API Connection...</h3>
        <p>Checking if the backend is reachable...</p>
      </div>
    );
  }

  if (healthStatus.error) {
    return (
      <div style={{
        padding: '20px',
        margin: '20px',
        border: '2px solid #f56565',
        borderRadius: '8px',
        backgroundColor: '#fed7d7',
        color: '#742a2a'
      }}>
        <h3>API Connection Failed</h3>
        <p><strong>Error:</strong> {healthStatus.error}</p>
        <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</p>
        <button
          onClick={checkHealth}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#f56565',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      border: '2px solid #48bb78',
      borderRadius: '8px',
      backgroundColor: '#f0fff4',
      color: '#22543d'
    }}>
      <h3>API Connection Successful</h3>
      <p><strong>Status:</strong> {healthStatus.data?.status || 'Unknown'}</p>
      <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</p>
      <pre style={{
        backgroundColor: '#f7fafc',
        padding: '10px',
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '12px',
        marginTop: '10px'
      }}>
        {JSON.stringify(healthStatus.data, null, 2)}
      </pre>
    </div>
  );
};

export default HealthCheck; 