import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Feature } from '../services/analysisParser';
import { ImplementationViewer } from './ImplementationViewer';

interface AnalysisResultProps {
  analysis: string;
  isLoading: boolean;
  error: string | null;
  features?: Feature[];
  sourceImage?: string;
}

/**
 * Component for displaying analysis results.
 * Shows loading state, error state, or the analysis content with markdown rendering.
 */
export function AnalysisResult({ analysis, isLoading, error, features, sourceImage }: AnalysisResultProps) {
  const [showImplementation, setShowImplementation] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(analysis).then(() => {
      alert('Analysis copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  if (!analysis && !isLoading && !error) {
    return null;
  }

  return (
    <section className="App-result">
      <h2>Analysis Result</h2>
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>⏳ Analyzing... (this may take a moment)</p>
        </div>
      )}
      {error && <p className="error-message">❌ Error: {error}</p>}
      {analysis && !isLoading && (
        <div>
          <div className="result-actions">
            <button
              onClick={handleCopyToClipboard}
              className="copy-button"
              title="Copy analysis to clipboard"
            >
              <span>📋 Copy Result</span>
            </button>
            {features && features.length > 0 && (
              <button
                onClick={() => setShowImplementation(true)}
                className="implement-button"
                title="Generate React implementation"
              >
                <span>⚛️ Implement in React</span>
              </button>
            )}
          </div>
          <div className="markdown-content">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}

      {showImplementation && features && (
        <ImplementationViewer
          features={features}
          sourceImage={sourceImage}
          onClose={() => setShowImplementation(false)}
        />
      )}
    </section>
  );
}
