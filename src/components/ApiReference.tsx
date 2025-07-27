import React from 'react';
import './ApiReference.css';

const ApiReference: React.FC = () => {
  const apiEndpoints = [
    {
      service: 'Main API',
      baseUrl: 'http://localhost:8000',
      endpoints: [
        { method: 'GET', path: '/', description: 'Main API information' },
        { method: 'GET', path: '/health', description: 'Health check' }
      ]
    },
    {
      service: 'Authentication',
      baseUrl: 'http://localhost:8000/auth',
      endpoints: [
        { method: 'POST', path: '/jwt/login', description: 'Login with email/password' },
        { method: 'POST', path: '/register', description: 'Register new user' },
        { method: 'GET', path: '/users/me', description: 'Get current user profile' },
        { method: 'GET', path: '/health', description: 'Auth service health' }
      ]
    },
    {
      service: 'Content Management',
      baseUrl: 'http://localhost:8000/content',
      endpoints: [
        { method: 'GET', path: '/health', description: 'Content service health check' },
        { method: 'POST', path: '/ingest', description: 'Ingest new content into the system' },
        { method: 'POST', path: '/search', description: 'Search for content matching query' }
      ]
    },
    {
      service: 'Assessment',
      baseUrl: 'http://localhost:8000/assessment',
      endpoints: [
        { method: 'GET', path: '/health', description: 'Assessment service health check' },
        { method: 'POST', path: '/grade', description: 'Grade assessment submissions' }
      ]
    },
    {
      service: 'Chat/AI Tutor',
      baseUrl: 'http://localhost:8000/chat',
      endpoints: [
        { method: 'GET', path: '/health', description: 'Chat service health check' },
        { method: 'POST', path: '/answer', description: 'Get AI tutor answer for a question' }
      ]
    },
    {
      service: 'Notifications',
      baseUrl: 'http://localhost:8000/notify',
      endpoints: [
        { method: 'GET', path: '/health', description: 'Notification service health check' },
        { method: 'POST', path: '/', description: 'Send a notification' }
      ]
    }
  ];

  return (
    <div className="api-reference">
      <h2>API Reference</h2>
      <p className="api-description">
        This is a comprehensive API reference for all Tutor Stack services. 
        All endpoints require JWT authentication except for login and registration.
      </p>
      
      <div className="api-services">
        {apiEndpoints.map((service, index) => (
          <div key={index} className="api-service">
            <h3>{service.service}</h3>
            <p className="base-url">Base URL: <code>{service.baseUrl}</code></p>
            
            <div className="endpoints">
              {service.endpoints.map((endpoint, endpointIndex) => (
                <div key={endpointIndex} className="endpoint">
                  <div className="method-badge">
                    <span className={`method ${endpoint.method.toLowerCase()}`}>
                      {endpoint.method}
                    </span>
                  </div>
                  <div className="endpoint-details">
                    <code className="path">{endpoint.path}</code>
                    <p className="description">{endpoint.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="authentication-info">
        <h3>Authentication</h3>
        <p>
          Most endpoints require JWT authentication. Include the token in the Authorization header:
        </p>
        <code className="auth-example">
          Authorization: Bearer &lt;your-jwt-token&gt;
        </code>
      </div>
    </div>
  );
};

export default ApiReference; 