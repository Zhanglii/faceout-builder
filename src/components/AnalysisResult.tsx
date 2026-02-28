import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalysisResultProps {
  analysis: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Component for displaying analysis results.
 * Shows loading state, error state, or the analysis content with markdown rendering.
 */
export function AnalysisResult({ analysis, isLoading, error }: AnalysisResultProps) {
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
          <button
            onClick={handleCopyToClipboard}
            className="copy-button"
            title="Copy analysis to clipboard"
          >
            📋 Copy Result
          </button>
          <div className="markdown-content">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </section>
  );
}
