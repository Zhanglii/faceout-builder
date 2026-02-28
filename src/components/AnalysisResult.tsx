import React from 'react';

interface AnalysisResultProps {
  analysis: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Component for displaying analysis results.
 * Shows loading state, error state, or the analysis content.
 */
export function AnalysisResult({ analysis, isLoading, error }: AnalysisResultProps) {
  if (!analysis && !isLoading && !error) {
    return null;
  }

  return (
    <section className="App-result">
      <h2>Analysis Result</h2>
      {isLoading && <p>Analyzing...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {analysis && !isLoading && <pre>{analysis}</pre>}
    </section>
  );
}
