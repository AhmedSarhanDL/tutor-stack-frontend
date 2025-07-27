import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestPage: React.FC = () => {
  const { user, isLoading, error } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = () => {
    setTestResults([]);
    
    // Test 1: Check if component renders
    addTestResult('✅ TestPage component rendered successfully');
    
    // Test 2: Check auth context
    addTestResult(`✅ Auth context loaded - User: ${user ? 'Logged in' : 'Not logged in'}`);
    addTestResult(`✅ Loading state: ${isLoading}`);
    addTestResult(`✅ Error state: ${error || 'None'}`);
    
    // Test 3: Check environment variables
    addTestResult(`✅ API Base URL: ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}`);
    
    // Test 4: Check localStorage
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    addTestResult(`✅ LocalStorage token: ${token ? 'Present' : 'Missing'}`);
    addTestResult(`✅ LocalStorage user: ${storedUser ? 'Present' : 'Missing'}`);
    
    // Test 5: Detailed localStorage analysis
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        addTestResult(`✅ LocalStorage user parsed successfully`);
        addTestResult(`✅ User email: ${parsedUser.email || 'Missing'}`);
        addTestResult(`✅ User ID: ${parsedUser.id || 'Missing'}`);
      } catch (e) {
        addTestResult(`❌ LocalStorage user parse failed: ${e}`);
        addTestResult(`❌ Raw user data: ${storedUser}`);
      }
    }
    
    // Test 6: Check window object
    addTestResult(`✅ Window location: ${window.location.href}`);
    addTestResult(`✅ User agent: ${navigator.userAgent.substring(0, 50)}...`);
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🧪 Tutor Stack Test Page</h1>
      
              <div style={{
          backgroundColor: '#f7fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2>Current State</h2>
          <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</p>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</p>
          <p><strong>Token:</strong> {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</p>
          <p><strong>Stored User:</strong> {localStorage.getItem('user') ? 'Present' : 'Missing'}</p>
          <p><strong>Current URL:</strong> {window.location.href}</p>
          <p><strong>Protected Route Test:</strong> ✅ This page is only accessible when authenticated</p>
        </div>

      <div style={{
        backgroundColor: '#f7fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2>Run Tests</h2>
        <button
          onClick={runTests}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          Run All Tests
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f56565',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Clear localStorage & Reload
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{
          backgroundColor: '#f7fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2>Test Results</h2>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '10px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {testResults.map((result, index) => (
              <div key={index} style={{
                padding: '4px 0',
                borderBottom: index < testResults.length - 1 ? '1px solid #e2e8f0' : 'none'
              }}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: '#f7fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h2>Navigation</h2>
        <p>
          <a href="/dashboard" style={{ color: '#4299e1', textDecoration: 'none' }}>
            → Go to Dashboard
          </a>
        </p>
        <p>
          <a href="/login" style={{ color: '#4299e1', textDecoration: 'none' }}>
            → Go to Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default TestPage; 