import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PdfUploadPage.css';

interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  description?: string;
  uploaded_at: string;
  status: string;
}

const PdfUploadPage: React.FC = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load uploaded files on component mount
  React.useEffect(() => {
    loadUploadedFiles();
  }, []);

  const loadUploadedFiles = async () => {
    try {
      const response = await api.get('/content/uploaded-files');
      setUploadedFiles(response.data.files || []);
    } catch (error: any) {
      console.error('Failed to load uploaded files:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load uploaded files'
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileUpload(pdfFile);
    } else {
      setMessage({
        type: 'error',
        text: 'Please drop a PDF file'
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setMessage({
        type: 'error',
        text: 'Please select a PDF file'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setMessage({
        type: 'error',
        text: 'File size must be less than 10MB'
      });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      await api.post('/content/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({
        type: 'success',
        text: `File "${file.name}" uploaded successfully!`
      });

      setDescription('');
      loadUploadedFiles(); // Refresh the file list

    } catch (error: any) {
      console.error('Upload failed:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pdf-upload-page">
      <div className="pdf-upload-container">
        <div className="pdf-upload-header">
          <h1>📄 PDF Upload</h1>
          <p>Upload PDF files to the content system</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-btn"
          >
            ← Back to Dashboard
          </button>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button 
              onClick={() => setMessage(null)}
              className="message-close"
            >
              ×
            </button>
          </div>
        )}

        <div className="upload-section">
          <div className="description-input">
            <label htmlFor="description">Description (optional):</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for the PDF content..."
              disabled={uploading}
            />
          </div>

          <div
            className={`upload-area ${isDragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <div className="upload-icon">📄</div>
              <h3>Drop your PDF file here</h3>
              <p>or</p>
              <label className="file-input-label">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                Choose File
              </label>
              <p className="upload-hint">
                Maximum file size: 10MB
              </p>
            </div>
            {uploading && (
              <div className="upload-progress">
                <div className="spinner"></div>
                <p>Uploading...</p>
              </div>
            )}
          </div>
        </div>

        <div className="uploaded-files-section">
          <h2>Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            <div className="no-files">
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div className="files-list">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">📄</div>
                    <div className="file-details">
                      <h4>{file.filename}</h4>
                      <p className="file-meta">
                        Size: {formatFileSize(file.size)} • 
                        Uploaded: {formatDate(file.uploaded_at)} • 
                        Status: <span className={`status ${file.status}`}>{file.status}</span>
                      </p>
                      {file.description && (
                        <p className="file-description">{file.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfUploadPage; 