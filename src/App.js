import React, { useState } from 'react';
import './App.css';
import { analyzeSnapshot } from './services/aiClient';

function App() {
  const [snapshot, setSnapshot] = useState('');
  const [analysis, setAnalysis] = useState('');

  const handleAnalyze = async () => {
    // call AI service to process snapshot
    const result = await analyzeSnapshot(snapshot);
    setAnalysis(result);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Faceout Builder</h1>
        <p>Upload a product snapshot or paste mock content for analysis.</p>
      </header>

      <main className="App-main">
        <textarea
          value={snapshot}
          onChange={(e) => setSnapshot(e.target.value)}
          placeholder="Paste snapshot content here..."
          rows={10}
          style={{ width: '100%' }}
        />
        <button onClick={handleAnalyze} style={{ marginTop: '1rem' }}>
          Analyze
        </button>

        {analysis && (
          <section className="App-result">
            <h2>Analysis Result</h2>
            <pre>{analysis}</pre>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
