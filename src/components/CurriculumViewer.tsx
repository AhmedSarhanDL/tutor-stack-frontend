import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './CurriculumViewer.css';

interface SubConcept {
  name: string;
  description: string;
  examples: string[];
}

interface Concept {
  name: string;
  description: string;
  examples: string[];
  sub_concepts: SubConcept[];
}

interface CurriculumData {
  concepts: Concept[];
}

const CurriculumViewer: React.FC = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCurriculum();
  }, []);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/content/curriculum');
      setCurriculum(response.data);
    } catch (err: any) {
      console.error('Failed to load curriculum:', err);
      setError(err.response?.data?.detail || 'Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const toggleConceptExpansion = (conceptName: string) => {
    const newExpanded = new Set(expandedConcepts);
    if (newExpanded.has(conceptName)) {
      newExpanded.delete(conceptName);
    } else {
      newExpanded.add(conceptName);
    }
    setExpandedConcepts(newExpanded);
  };

  const filteredConcepts = curriculum?.concepts.filter(concept =>
    concept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    concept.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleConceptClick = (concept: Concept) => {
    setSelectedConcept(concept);
  };

  const closeConceptDetail = () => {
    setSelectedConcept(null);
  };

  if (loading) {
    return (
      <div className="curriculum-viewer">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading curriculum data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="curriculum-viewer">
        <div className="error-container">
          <h2>Error Loading Curriculum</h2>
          <p>{error}</p>
          <button onClick={loadCurriculum} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="curriculum-viewer">
      <div className="curriculum-container">
        <div className="curriculum-header">
          <h1>📚 Curriculum Viewer</h1>
          <p>Explore the unified curriculum concepts and learning materials</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-btn"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="curriculum-content">
          <div className="search-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search concepts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="search-stats">
              {curriculum && (
                <p>
                  Showing {filteredConcepts.length} of {curriculum.concepts.length} concepts
                </p>
              )}
            </div>
          </div>

          <div className="concepts-grid">
            {filteredConcepts.map((concept, index) => (
              <div 
                key={index} 
                className={`concept-card ${expandedConcepts.has(concept.name) ? 'expanded' : ''}`}
              >
                <div 
                  className="concept-header"
                  onClick={() => toggleConceptExpansion(concept.name)}
                >
                  <h3>{concept.name}</h3>
                  <button className="expand-btn">
                    {expandedConcepts.has(concept.name) ? '−' : '+'}
                  </button>
                </div>
                
                <div className="concept-description">
                  <p>{concept.description}</p>
                </div>

                {expandedConcepts.has(concept.name) && (
                  <div className="concept-details">
                    <div className="examples-section">
                      <h4>Examples:</h4>
                      <ul>
                        {concept.examples.slice(0, 3).map((example, idx) => (
                          <li key={idx}>{example}</li>
                        ))}
                        {concept.examples.length > 3 && (
                          <li className="more-examples">
                            ... and {concept.examples.length - 3} more examples
                          </li>
                        )}
                      </ul>
                    </div>

                    {concept.sub_concepts && concept.sub_concepts.length > 0 && (
                      <div className="sub-concepts-section">
                        <h4>Sub-concepts ({concept.sub_concepts.length}):</h4>
                        <div className="sub-concepts-list">
                          {concept.sub_concepts.map((subConcept, idx) => (
                            <div key={idx} className="sub-concept-item">
                              <h5>{subConcept.name}</h5>
                              <p>{subConcept.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      className="view-detail-btn"
                      onClick={() => handleConceptClick(concept)}
                    >
                      View Full Details
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredConcepts.length === 0 && searchTerm && (
            <div className="no-results">
              <p>No concepts found matching "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Concept Detail Modal */}
      {selectedConcept && (
        <div className="modal-overlay" onClick={closeConceptDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedConcept.name}</h2>
              <button onClick={closeConceptDetail} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <div className="concept-full-description">
                <h3>Description</h3>
                <p>{selectedConcept.description}</p>
              </div>

              <div className="concept-full-examples">
                <h3>Examples</h3>
                <ul>
                  {selectedConcept.examples.map((example, idx) => (
                    <li key={idx}>{example}</li>
                  ))}
                </ul>
              </div>

              {selectedConcept.sub_concepts && selectedConcept.sub_concepts.length > 0 && (
                <div className="concept-full-sub-concepts">
                  <h3>Sub-concepts</h3>
                  {selectedConcept.sub_concepts.map((subConcept, idx) => (
                    <div key={idx} className="full-sub-concept">
                      <h4>{subConcept.name}</h4>
                      <p>{subConcept.description}</p>
                      {subConcept.examples && subConcept.examples.length > 0 && (
                        <div className="sub-concept-examples">
                          <h5>Examples:</h5>
                          <ul>
                            {subConcept.examples.map((example, exampleIdx) => (
                              <li key={exampleIdx}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumViewer; 