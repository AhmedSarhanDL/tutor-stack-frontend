import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../contexts/AuthContext';
import './ChatPage.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `Hello ${user?.first_name || user?.email || 'there'}! I'm your AI tutor. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [user]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/chat/answer', {
        question: userMessage.text,
      });

      const aiResponse = response.data;
      
      // Update the AI message with the response
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id 
          ? { ...msg, text: aiResponse.answer || aiResponse.message || aiResponse.text || 'I apologize, but I couldn\'t generate a response at this time.', isLoading: false }
          : msg
      ));
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to get response from AI tutor';
      setError(errorMessage);
      
      // Update the AI message with error
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id 
          ? { ...msg, text: 'Sorry, I encountered an error. Please try again.', isLoading: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-header-content">
          <h1>🤖 AI Tutor Chat</h1>
          <p>Ask me anything about your studies!</p>
        </div>
        <div className="chat-header-actions">
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-btn"
            title="Back to Dashboard"
          >
            ← Dashboard
          </button>
          <button 
            onClick={clearChat}
            className="clear-chat-btn"
            title="Clear chat history"
          >
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">
                <div className="message-sender">
                  {message.sender === 'user' ? '👤 You' : '🤖 AI Tutor'}
                </div>
                <div className="message-text">
                  {message.isLoading ? (
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    message.text
                  )}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question here... (Press Enter to send, Shift+Enter for new line)"
              disabled={isLoading}
              className="message-input"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
          <div className="input-hint">
            💡 Try asking questions like: "What is machine learning?" or "Explain neural networks"
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 