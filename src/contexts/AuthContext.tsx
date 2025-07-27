import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  register: (email: string, password: string, first_name?: string, last_name?: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - adjust based on your setup
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Note: We can't use navigate here since this is outside React context
      // The component will handle the redirect when it detects no user
    }
    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log('AuthContext: Initializing auth state...');
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    console.log('AuthContext: Stored token exists:', !!storedToken);
    console.log('AuthContext: Stored user exists:', !!storedUser);
    console.log('AuthContext: Stored user raw data:', storedUser);
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext: Parsed user data:', parsedUser);
        
        // Validate user data structure
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.email) {
          setToken(storedToken);
          setUser(parsedUser);
          console.log('AuthContext: Successfully restored user session');
        } else {
          throw new Error('Invalid user data structure');
        }
      } catch (error) {
        console.error('AuthContext: Error parsing stored user data:', error);
        console.error('AuthContext: Raw stored user data:', storedUser);
        setError('Failed to restore user session - invalid data format');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('AuthContext: No stored session found');
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting login with:', email);
      
      // Use form data as required by FastAPI Users
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/jwt/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      console.log('AuthContext: Login successful, got access token');
      
      if (!access_token) {
        throw new Error('No access token received from server');
      }
      
      // Set the token first so we can make authenticated requests
      setToken(access_token);
      localStorage.setItem('auth_token', access_token);
      
      // Now fetch the user data using the token
      try {
        console.log('AuthContext: Fetching user data...');
        const userResponse = await api.get('/auth/users/me');
        const userData = userResponse.data;
        console.log('AuthContext: User data received:', userData);
        
        // Validate user data
        if (!userData || !userData.email) {
          throw new Error('Invalid user data received from server');
        }
        
        // Clear any previous error
        setError(null);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        console.log('AuthContext: User state updated, token and user set');
        console.log('AuthContext: Stored token:', access_token);
        console.log('AuthContext: Stored user:', JSON.stringify(userData));
      } catch (userError) {
        console.error('AuthContext: Error fetching user data:', userError);
        // If we can't get user data, we'll still have the token
        // Create a minimal user object from the email
        const minimalUser = {
          id: 'unknown',
          email: email,
          first_name: '',
          last_name: '',
          role: 'user',
          is_active: true
        };
        localStorage.setItem('user', JSON.stringify(minimalUser));
        setUser(minimalUser);
        console.log('AuthContext: Using minimal user data');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google/authorize`;
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    console.log('AuthContext: Clearing error state');
    setError(null);
  };

  const register = async (email: string, password: string, first_name?: string, last_name?: string) => {
    try {
      console.log('AuthContext: Attempting registration with:', email);
      
      const response = await api.post('/auth/register', {
        email,
        password,
        first_name,
        last_name,
      });

      const { access_token } = response.data;
      console.log('AuthContext: Registration successful, got access token');
      
      if (!access_token) {
        throw new Error('No access token received from server');
      }
      
      // Set the token first
      setToken(access_token);
      localStorage.setItem('auth_token', access_token);
      
      // Try to fetch user data, but if it fails, create minimal user data
      try {
        console.log('AuthContext: Fetching user data after registration...');
        const userResponse = await api.get('/auth/users/me');
        const userData = userResponse.data;
        console.log('AuthContext: User data received:', userData);
        
        if (!userData || !userData.email) {
          throw new Error('Invalid user data received from server');
        }
        
        setError(null);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (userError) {
        console.error('AuthContext: Error fetching user data after registration:', userError);
        // Create user data from registration info
        const userData = {
          id: 'new_user',
          email: email,
          first_name: first_name || '',
          last_name: last_name || '',
          role: 'user',
          is_active: true
        };
        setError(null);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('AuthContext: Using registration user data');
      }
      
      console.log('AuthContext: Registration state updated, token and user set');
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    register,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { api }; 