import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './CurriculumViewer.css';

// --- TypeScript Interfaces ---

interface SubConcept {
  name: string;
  description: string;
  examples?: string[];
  exercises?: any[];
}

interface Concept {
  name: string;
  description: string;
  examples?: string[];
  sub_concepts?: SubConcept[];
  exercises?: any[];
  // Metadata will be added on the frontend
  metadata?: {
    grade: string;
    term: string;
    subject: string;
  };
}

interface GradeStructureData {
    grade: string;
    terms: {
      [term: string]: string[];
    };
}

interface CurriculumStructure {
  grade: string;
  structure: GradeStructureData;
  user_grade?: string;
}

const CurriculumViewer: React.FC = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [structure, setStructure] = useState<CurriculumStructure | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingConcepts, setLoadingConcepts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(new Set());
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [filteredConcepts, setFilteredConcepts] = useState<Concept[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadAvailableGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      loadCurriculumStructure();
    }
  }, [selectedGrade]);

  useEffect(() => {
      if (selectedGrade && selectedTerm && selectedSubject) {
          loadConcepts();
      } else {
          setConcepts([]);
      }
  }, [selectedGrade, selectedTerm, selectedSubject]);

  useEffect(() => {
    filterConcepts();
  }, [concepts, searchTerm]);

  const loadAvailableGrades = async () => {
    try {
      const response = await api.get('/content/curriculum/grades');
      setAvailableGrades(response.data.grades);
      await loadUserCurriculum();
    } catch (err: any) {
      console.error('Failed to load available grades:', err);
      setError(err.response?.data?.detail || 'Failed to load available grades');
      await loadUserCurriculum();
    }
  };

  const loadUserCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/content/curriculum/user');
      setStructure(response.data);
      setSelectedGrade(response.data.grade);
    } catch (err: any) {
      console.error('Failed to load user curriculum:', err);
      setError(err.response?.data?.detail || 'Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculumStructure = async () => {
    if (!selectedGrade) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/content/curriculum/structure/${selectedGrade}`);
      setStructure({
          grade: selectedGrade,
          structure: response.data,
      });
    } catch (err: any) {
      console.error('Failed to load curriculum structure:', err);
      setError(err.response?.data?.detail || 'Failed to load curriculum structure');
    } finally {
      setLoading(false);
    }
  };

  const loadConcepts = async () => {
      if (!selectedGrade || !selectedTerm || !selectedSubject) return;
      try {
          setLoadingConcepts(true);
          setIsGenerating(false);
          setError(null);
          const response = await api.get(`/content/curriculum/${selectedGrade}/${selectedTerm}/${selectedSubject}`);
          const { concepts, grade, term, subject } = response.data;

          const conceptsWithMetadata = concepts.map((concept: Concept) => ({
              ...concept,
              metadata: { grade, term, subject }
          }));

          if (conceptsWithMetadata.length === 1 && conceptsWithMetadata[0].name === "Generating Concepts") {
              setIsGenerating(true);
              setConcepts([]);
          } else {
              setConcepts(conceptsWithMetadata);
          }
      } catch (err: any) {
          console.error('Failed to load concepts:', err);
          setError(err.response?.data?.detail || 'Failed to load concepts');
      } finally {
          setLoadingConcepts(false);
      }
  };

  const filterConcepts = () => {
    if (!concepts) {
      setFilteredConcepts([]);
      return;
    }
    let filtered = concepts;
    if (searchTerm) {
      filtered = filtered.filter(concept =>
        (concept.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (concept.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredConcepts(filtered);
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

  const handleConceptClick = (concept: Concept) => {
    setSelectedConcept(concept);
  };

  const closeConceptDetail = () => {
    setSelectedConcept(null);
  };

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedTerm('');
    setSelectedSubject('');
    setConcepts([]);
    setError(null);
  };

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    setSelectedSubject('');
    setConcepts([]);
    setError(null);
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setError(null);
  };
  
  const renderError = () => (
    <div className="error-container">
        <h2>Error Loading Curriculum</h2>
        <p>{error}</p>
        <button onClick={loadUserCurriculum} className="retry-btn">
        Try Again
        </button>
    </div>
  )

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

  const getAvailableTerms = () => {
    if (!structure?.structure?.terms) return [];
    return Object.keys(structure.structure.terms);
  };

  const getAvailableSubjects = () => {
    if (!structure?.structure?.terms || !selectedTerm) return [];
    return structure.structure.terms[selectedTerm] || [];
  };

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
          <div className="grade-selection">
            <label htmlFor="grade-select">Select Grade:</label>
            <select
              id="grade-select"
              value={selectedGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="grade-select"
            >
              <option value="">Choose a grade...</option>
              {availableGrades.map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {structure && (
            <div className="filters-section">
              <div className="filter-group">
                <label htmlFor="term-select">Term:</label>
                <select
                  id="term-select"
                  value={selectedTerm}
                  onChange={(e) => handleTermChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Terms</option>
                  {getAvailableTerms().map(term => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="subject-select">Subject:</label>
                <select
                  id="subject-select"
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="filter-select"
                  disabled={!selectedTerm}
                >
                  <option value="">All Subjects</option>
                  {getAvailableSubjects().map(subject => (
                    <option key={subject} value={subject}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && renderError()}

          {!error && (
            <>
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
                    {concepts && (
                        <p>
                        Showing {filteredConcepts.length} of {concepts.length} concepts
                        </p>
                    )}
                    </div>
                </div>

                {loadingConcepts ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading concepts...</p>
                    </div>
                ) : isGenerating ? (
                    <div className="generating-container">
                        <div className="spinner"></div>
                        <p>We are generating the curriculum for this subject. Please check back in a few minutes.</p>
                    </div>
                ) : (
                    <div className="concepts-grid">
                        {filteredConcepts.map((concept, index) => (
                        <div 
                            key={concept.name || index} 
                            className={`concept-card ${expandedConcepts.has(concept.name || '') ? 'expanded' : ''}`}
                        >
                            <div 
                            className="concept-header"
                            onClick={() => toggleConceptExpansion(concept.name || '')}
                            >
                            <h3>{concept.name || 'Unnamed Concept'}</h3>
                            <button className="expand-btn">
                                {expandedConcepts.has(concept.name || '') ? '−' : '+'}
                            </button>
                            </div>
                            
                            {concept.description && (
                            <div className="concept-description">
                                <p>{concept.description}</p>
                            </div>
                            )}

                            {concept.metadata && (
                            <div className="concept-metadata">
                                <span className="metadata-tag">{concept.metadata.term}</span>
                                <span className="metadata-tag">{concept.metadata.subject}</span>
                            </div>
                            )}

                            {expandedConcepts.has(concept.name || '') && (
                            <div className="concept-details">
                                {(concept.examples && concept.examples.length > 0) && (
                                <div className="examples-section">
                                    <h4>Examples:</h4>
                                    <ul>
                                    {(concept.examples || []).slice(0, 3).map((example, idx) => (
                                        <li key={idx}>{example}</li>
                                    ))}
                                    {(concept.examples || []).length > 3 && (
                                        <li className="more-examples">
                                        ... and {(concept.examples || []).length - 3} more examples
                                        </li>
                                    )}
                                    </ul>
                                </div>
                                )}

                                {concept.sub_concepts && concept.sub_concepts.length > 0 && (
                                <div className="sub-concepts-section">
                                    <h4>Sub-concepts ({concept.sub_concepts.length}):</h4>
                                    <div className="sub-concepts-list">
                                    {concept.sub_concepts.map((subConcept, idx) => (
                                        <div key={idx} className="sub-concept-item">
                                        <h5>{subConcept.name || 'Unnamed Sub-concept'}</h5>
                                        {subConcept.description && <p>{subConcept.description}</p>}
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
                )}

                {filteredConcepts.length === 0 && (searchTerm || selectedTerm || selectedSubject) && !loadingConcepts && !isGenerating && (
                    <div className="no-results">
                    <p>No concepts found matching your filters</p>
                    <button 
                        onClick={() => {
                        setSearchTerm('');
                        }}
                        className="clear-search-btn"
                    >
                        Clear Search
                    </button>
                    </div>
                )}
            </>
          )}
        </div>
      </div>

      {selectedConcept && (
        <div className="modal-overlay" onClick={closeConceptDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedConcept.name || 'Unnamed Concept'}</h2>
              <button onClick={closeConceptDetail} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              {selectedConcept.metadata && (
                <div className="concept-metadata-modal">
                  <span className="metadata-tag">{selectedConcept.metadata.term}</span>
                  <span className="metadata-tag">{selectedConcept.metadata.subject}</span>
                </div>
              )}

              {selectedConcept.description && (
                <div className="concept-full-description">
                  <h3>Description</h3>
                  <p>{selectedConcept.description}</p>
                </div>
              )}

              {(selectedConcept.examples && selectedConcept.examples.length > 0) && (
                <div className="concept-full-examples">
                  <h3>Examples</h3>
                  <ul>
                    {(selectedConcept.examples || []).map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConcept.sub_concepts && selectedConcept.sub_concepts.length > 0 && (
                <div className="concept-full-sub-concepts">
                  <h3>Sub-concepts</h3>
                  {selectedConcept.sub_concepts.map((subConcept, idx) => (
                    <div key={idx} className="full-sub-concept">
                      <h4>{subConcept.name || 'Unnamed Sub-concept'}</h4>
                      {subConcept.description && <p>{subConcept.description}</p>}
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
