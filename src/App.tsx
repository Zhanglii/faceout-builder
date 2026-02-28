import React from 'react';
import './App.css';
import { useFileUpload } from './hooks/useFileUpload';
import { useAnalysis } from './hooks/useAnalysis';
import { FileUploadInput } from './components/FileUploadInput';
import { ImagePreview } from './components/ImagePreview';
import { TextInput } from './components/TextInput';
import { AnalysisResult } from './components/AnalysisResult';

/**
 * Main application component for analyzing product snapshots.
 * Manages file uploads, text input, and AI analysis workflow.
 */
function App() {
  const file = useFileUpload();
  const analysis = useAnalysis();

  const handleAnalyzeClick = async () => {
    await analysis.performAnalysis(file.content);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Faceout Builder</h1>
        <p>Upload a product snapshot or paste mock content for analysis.</p>
      </header>

      <main className="App-main">
        <FileUploadInput onFileSelect={file.handleFileSelect} />
        <ImagePreview imageSrc={file.imageSrc} />
        <TextInput
          value={file.snapshot}
          onChange={file.setSnapshot}
          disabled={!!file.imageSrc}
        />
        <button onClick={handleAnalyzeClick} style={{ marginTop: '1rem' }}>
          Analyze
        </button>

        <AnalysisResult
          analysis={analysis.analysis}
          isLoading={analysis.isLoading}
          error={analysis.error}
        />
      </main>
    </div>
  );
}

export default App;
