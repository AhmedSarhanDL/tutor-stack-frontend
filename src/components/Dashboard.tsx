import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../contexts/AuthContext';
import ApiReference from './ApiReference';
import HealthCheck from './HealthCheck';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [showApiReference, setShowApiReference] = useState(false);

  useEffect(() => {
    console.log('Dashboard useEffect - checking API status');
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    console.log('Checking API status...');
    setLoading(true);
    
    const services = [
      { name: 'Main API', endpoint: '/health' },
      { name: 'Content Service', endpoint: '/content/health' },
      { name: 'Assessment Service', endpoint: '/assessment/health' },
      { name: 'Chat Service', endpoint: '/chat/health' },
      { name: 'Notification Service', endpoint: '/notify/health' },
      { name: 'Auth Service', endpoint: '/auth/health' }
    ];

    const status: {[key: string]: any} = {};
    
    for (const service of services) {
      try {
        console.log(`Testing ${service.name} at ${service.endpoint}`);
        const response = await api.get(service.endpoint);
        console.log(`${service.name} response:`, response.data);
        status[service.name] = {
          status: 'online',
          data: response.data,
          endpoint: service.endpoint
        };
      } catch (error: any) {
        console.error(`${service.name} error:`, error);
        const errorMessage = error.response?.data?.detail || error.message || 'Network error';
        status[service.name] = {
          status: 'offline',
          error: errorMessage,
          endpoint: service.endpoint,
          statusCode: error.response?.status
        };
      }
    }
    
    console.log('Final API status:', status);
    setApiStatus(status);
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const testApiEndpoint = async (endpoint: string, name: string, method: 'GET' | 'POST' = 'GET', data?: any) => {
    try {
      let response;
      if (method === 'POST') {
        response = await api.post(endpoint, data);
      } else {
        response = await api.get(endpoint);
      }
      alert(`${name} API Test:\nStatus: ${response.status}\nData: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      alert(`${name} API Test Failed:\nError: ${error.response?.status || 'Network error'}\nMessage: ${error.response?.data?.detail || error.message}`);
    }
  };

  const testPostEndpoints = async () => {
    console.log('Testing all POST endpoints with realistic data...');
    
    // Test content ingestion
    await testApiEndpoint('/content/ingest', 'Content Ingestion', 'POST', { 
      text: 'Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task. It includes algorithms like linear regression, decision trees, neural networks, and support vector machines.' 
    });
    
    // Test content search
    await testApiEndpoint('/content/search', 'Content Search', 'POST', { 
      text: 'machine learning algorithms' 
    });
    
    // Test assessment grading
    await testApiEndpoint('/assessment/grade', 'Assessment Grading', 'POST', { 
      answer: 'Supervised learning uses labeled training data to learn a mapping from inputs to outputs, while unsupervised learning finds patterns in unlabeled data without predefined outputs.' 
    });
    
    // Test chat answer
    await testApiEndpoint('/chat/answer', 'Chat Answer', 'POST', { 
      question: 'What are the main types of machine learning?' 
    });
    
    // Test notification
    await testApiEndpoint('/notify/', 'Notification', 'POST', { 
      message: 'Welcome to Tutor Stack! Your learning journey begins now.',
      type: 'info',
      user_id: user?.id || 'unknown'
    });
  };

  console.log('Dashboard render - user:', user, 'loading:', loading, 'apiStatus:', apiStatus);

  if (!user) {
    console.log('No user found, showing loading...');
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Tutor Stack</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="user-card">
          <h2>User Information</h2>
          <div className="user-info">
            <p><strong>Email:</strong> {user.email}</p>
            {user.first_name && <p><strong>First Name:</strong> {user.first_name}</p>}
            {user.last_name && <p><strong>Last Name:</strong> {user.last_name}</p>}
            <p><strong>Role:</strong> {user.role || 'student'}</p>
            {user.grade && <p><strong>Grade:</strong> {user.grade}</p>}
            <p><strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>

        <div className="welcome-card">
          <h2>Welcome to Tutor Stack Dashboard!</h2>
          <p>You are successfully logged in. Use the tools below to test and explore the API services.</p>
        </div>

        <HealthCheck />

        <div className="api-status-card">
          <h2>API Services Status</h2>
          {loading ? (
            <p>Checking API status...</p>
          ) : Object.keys(apiStatus).length > 0 ? (
            <div className="api-grid">
              {Object.entries(apiStatus).map(([name, info]: [string, any]) => (
                <div key={name} className={`api-item ${info.status}`}>
                  <h3>{name}</h3>
                  <p className="status">
                    Status: <span className={info.status}>{info.status}</span>
                  </p>
                  <p className="endpoint">Endpoint: {info.endpoint}</p>
                  {info.status === 'online' && (
                    <button 
                      onClick={() => testApiEndpoint(info.endpoint, name)}
                      className="test-btn"
                    >
                      Test API
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="error-message">
              <p>Failed to load API status. Please check your connection and try again.</p>
              <button onClick={checkApiStatus} className="retry-btn">
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="features-card">
          <h2>Available Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>📚 Content Management</h3>
              <p>Access and manage learning content, courses, and materials</p>
              <div className="feature-buttons">
                <button 
                  onClick={() => navigate('/pdf-upload')}
                  className="feature-btn primary"
                >
                  📄 Upload PDF
                </button>
                <button 
                  onClick={() => navigate('/curriculum')}
                  className="feature-btn primary"
                >
                  📚 View Curriculum
                </button>
                <button 
                  onClick={() => testApiEndpoint('/content/ingest', 'Content Ingestion', 'POST', { 
                    text: 'Sample learning content about machine learning algorithms and their applications in real-world scenarios.' 
                  })}
                  className="feature-btn"
                >
                  📥 Ingest Content
                </button>
                <button 
                  onClick={() => testApiEndpoint('/content/search', 'Content Search', 'POST', { 
                    text: 'machine learning' 
                  })}
                  className="feature-btn"
                >
                  🔍 Search Content
                </button>
              </div>
            </div>
            <div className="feature-item">
              <h3>📝 Assessment</h3>
              <p>Take quizzes, assessments, and track your progress</p>
              <div className="feature-buttons">
                <button 
                  onClick={() => testApiEndpoint('/assessment/grade', 'Assessment Grading', 'POST', { 
                    answer: 'Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.' 
                  })}
                  className="feature-btn"
                >
                  ✅ Grade Answer
                </button>
                <button 
                  onClick={() => testApiEndpoint('/assessment/', 'Assessment List', 'GET')}
                  className="feature-btn"
                >
                  📋 List Assessments
                </button>
              </div>
            </div>
            <div className="feature-item">
              <h3>🤖 Chat Support</h3>
              <p>Get help from AI tutors and chat with the system</p>
              <div className="feature-buttons">
                <button 
                  onClick={() => navigate('/chat')}
                  className="feature-btn primary"
                >
                  💬 Open Chat
                </button>
                <button 
                  onClick={() => testApiEndpoint('/chat/answer', 'Chat Answer', 'POST', { 
                    question: 'What is the difference between supervised and unsupervised learning?' 
                  })}
                  className="feature-btn"
                >
                  🧪 Test API
                </button>
              </div>
            </div>
            <div className="feature-item">
              <h3>🔔 Notifications</h3>
              <p>Stay updated with notifications and alerts</p>
              <div className="feature-buttons">
                <button 
                  onClick={() => testApiEndpoint('/notify/', 'Send Notification', 'POST', { 
                    message: 'Welcome to Tutor Stack! Your learning journey begins now.',
                    type: 'info',
                    user_id: user?.id || 'unknown'
                  })}
                  className="feature-btn"
                >
                  📤 Send Notification
                </button>
                <button 
                  onClick={() => testApiEndpoint('/notify/', 'Get Notifications', 'GET')}
                  className="feature-btn"
                >
                  📬 Get Notifications
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="debug-card">
          <h2>Debug Information</h2>
          <div className="debug-info">
            <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>API Status Count:</strong> {Object.keys(apiStatus).length}</p>
            <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</p>
            <button onClick={checkApiStatus} className="debug-btn">
              Force Refresh API Status
            </button>
          </div>
        </div>

        <div className="api-testing-card">
          <h2>API Testing Tools</h2>
          <div className="testing-tools">
            <div className="tool-item">
              <h3>🔍 Health Check</h3>
              <p>Check the health of all services</p>
              <button 
                onClick={checkApiStatus}
                className="tool-btn"
              >
                Refresh Status
              </button>
            </div>
            <div className="tool-item">
              <h3>🔐 Auth Test</h3>
              <p>Test authentication endpoints</p>
              <button 
                onClick={() => testApiEndpoint('/auth/users/me', 'User Profile')}
                className="tool-btn"
              >
                Get My Profile
              </button>
            </div>
            <div className="tool-item">
              <h3>📊 Main API</h3>
              <p>Test the main API endpoints</p>
              <button 
                onClick={() => testApiEndpoint('/', 'Main API')}
                className="tool-btn"
              >
                Test Main API
              </button>
            </div>
            <div className="tool-item">
              <h3>📚 API Reference</h3>
              <p>View complete API documentation</p>
              <button 
                onClick={() => setShowApiReference(!showApiReference)}
                className="tool-btn"
              >
                {showApiReference ? 'Hide' : 'Show'} API Docs
              </button>
            </div>
            <div className="tool-item">
              <h3>🧪 Test All POST APIs</h3>
              <p>Test all POST endpoints with sample data</p>
              <button 
                onClick={testPostEndpoints}
                className="tool-btn"
              >
                Test All POST APIs
              </button>
            </div>
          </div>
        </div>

        {showApiReference && <ApiReference />}
      </div>
    </div>
  );
};

export default Dashboard; 