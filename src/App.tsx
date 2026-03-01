import React, { useState, useEffect } from 'react';
import './App.css';
import { useFileUpload } from './hooks/useFileUpload';
import { useAnalysis } from './hooks/useAnalysis';
import { InputTabs } from './components/InputTabs';
import { FileUploadInput } from './components/FileUploadInput';
import { ImagePreview } from './components/ImagePreview';
import { TextInput } from './components/TextInput';
import { AnalysisResult } from './components/AnalysisResult';
import { parseAnalysis, AnalysisStructure } from './services/analysisParser';

/**
 * Main application component for analyzing product snapshots.
 * Manages file uploads, text input, and AI analysis workflow with tab-based input selection.
 */
function App() {
  const file = useFileUpload();
  const analysis = useAnalysis();
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [parsedAnalysis, setParsedAnalysis] = useState<AnalysisStructure | null>(null);

  // Parse analysis result when it updates
  useEffect(() => {
    if (analysis.analysis) {
      try {
        const parsed = parseAnalysis(analysis.analysis);
        setParsedAnalysis(parsed);
      } catch (err) {
        console.error('Failed to parse analysis:', err);
        setParsedAnalysis(null);
      }
    } else {
      setParsedAnalysis(null);
    }
  }, [analysis.analysis]);

  const handleAnalyzeClick = async () => {
    await analysis.performAnalysis(file.content);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Faceout Builder</h1>
        <p>Analyze product snapshots and extract UI/data structure for implementation.</p>
      </header>

      <main className="App-main">
        <InputTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'upload' && (
          <div className="tab-content upload-tab">
            <FileUploadInput onFileSelect={file.handleFileSelect} />
            {file.imageSrc && (
              <div className="preview-section">
                <h3>Preview</h3>
                <ImagePreview imageSrc={file.imageSrc} />
              </div>
            )}
            {file.imageSrc && (
              <button
                onClick={() => file.clearFiles()}
                className="clear-button"
              >
                ✕ Clear & Choose Another
              </button>
            )}
          </div>
        )}

        {activeTab === 'text' && (
          <div className="tab-content text-tab">
            <TextInput
              value={file.snapshot}
              onChange={file.setSnapshot}
              disabled={false}
            />
          </div>
        )}

        <button
          onClick={handleAnalyzeClick}
          disabled={analysis.isLoading || !file.hasContent}
          className="analyze-button"
        >
          {analysis.isLoading ? 'Processing...' : 'Analyze'}
        </button>

        <div className="analysis-results-container">
          <AnalysisResult
            analysis={analysis.analysis}
            isLoading={analysis.isLoading}
            error={analysis.error}
            features={parsedAnalysis?.features}
            sourceImage={file.imageSrc || undefined}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
