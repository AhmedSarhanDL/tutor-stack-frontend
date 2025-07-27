import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Since protection is now handled at the App level,
// this component is just a simple wrapper
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute; 