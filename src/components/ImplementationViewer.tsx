import React, { useState } from 'react';
import { Feature } from '../services/analysisParser';
import { RenderableComponent } from './RenderableComponent';
import './ImplementationViewer.css';

interface ImplementationViewerProps {
  features: Feature[];
  sourceImage?: string;
  onClose: () => void;
}

type ViewMode = 'preview' | 'jsx' | 'css';

/**
 * Component viewer showing live preview + copyable source code
 */
export function ImplementationViewer({ features, sourceImage, onClose }: ImplementationViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [copied, setCopied] = useState<ViewMode | null>(null);

  const jsxCode = generateJSXCode(features);
  const cssCode = generateCSSCode();

  const handleCopy = (code: string, mode: ViewMode) => {
    navigator.clipboard.writeText(code);
    setCopied(mode);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="implementation-viewer-overlay">
      <div className="implementation-viewer">
        <div className="viewer-header">
          <h2>React Implementation</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="view-tabs">
          <button
            className={`tab-button ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            🎨 Live Preview
          </button>
          <button
            className={`tab-button ${viewMode === 'jsx' ? 'active' : ''}`}
            onClick={() => setViewMode('jsx')}
          >
            ⚛️ JSX Code
          </button>
          <button
            className={`tab-button ${viewMode === 'css' ? 'active' : ''}`}
            onClick={() => setViewMode('css')}
          >
            🎨 CSS Code
          </button>
        </div>

        <div className="viewer-content">
          {viewMode === 'preview' && (
            <div className="preview-container">
              <RenderableComponent features={features} sourceImage={sourceImage} title="Product Display" />
              <div className="preview-info">
                <p>✅ This preview renders extracted values from the analysis output.</p>
                <p>You can wire API calls later in the generated JSX.</p>
              </div>
            </div>
          )}

          {viewMode === 'jsx' && (
            <div className="code-container">
              <div className="code-header">
                <span className="code-filename">ProductDisplay.jsx</span>
                <button
                  className={`copy-code-button ${copied === 'jsx' ? 'copied' : ''}`}
                  onClick={() => handleCopy(jsxCode, 'jsx')}
                >
                  {copied === 'jsx' ? '✓ Copied!' : '📋 Copy Code'}
                </button>
              </div>
              <pre className="code-block">
                <code>{jsxCode}</code>
              </pre>
            </div>
          )}

          {viewMode === 'css' && (
            <div className="code-container">
              <div className="code-header">
                <span className="code-filename">ProductDisplay.css</span>
                <button
                  className={`copy-code-button ${copied === 'css' ? 'copied' : ''}`}
                  onClick={() => handleCopy(cssCode, 'css')}
                >
                  {copied === 'css' ? '✓ Copied!' : '📋 Copy Code'}
                </button>
              </div>
              <pre className="code-block">
                <code>{cssCode}</code>
              </pre>
            </div>
          )}
        </div>

        <div className="viewer-footer">
          <p className="instructions">
            💡 Copy the code above and paste it into your React project. Then replace mock data with real API calls.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate JSX code with mock data
 */
function generateJSXCode(features: Feature[]): string {
  const mockDataObj: Record<string, any> = {};

  features.forEach((f, idx) => {
    const key = `feature${idx}`;
    mockDataObj[key] = f.mockData || generateMockForType(f.dataType);
  });

  const mockDataString = JSON.stringify(mockDataObj, null, 2);

  const featureRenders = features
    .map((f, idx) => {
      const key = `feature${idx}`;
      switch (f.dataType) {
        case 'rating':
          return `      <div className="feature feature-rating">
        <h3>${f.name}</h3>
        <div className="rating">
          <span className="stars">
            {"★".repeat(Math.floor(data.${key}.stars))}
            {"☆".repeat(5 - Math.floor(data.${key}.stars))}
          </span>
          <span className="rating-value">{data.${key}.stars}</span>
          <span className="rating-count">({data.${key}.count} reviews)</span>
        </div>
      </div>`;

        case 'number':
          return `      <div className="feature feature-number">
        <label>${f.name}:</label>
        <span className="value">{data.${key}}</span>
      </div>`;

        case 'image':
          return `      <div className="feature feature-image">
        <h3>${f.name}</h3>
        <img src={data.${key}} alt="${f.name}" />
      </div>`;

        case 'list':
          return `      <div className="feature feature-list">
        <h3>${f.name}</h3>
        <ul>
          {data.${key}.map((item, idx) => (
            <li key={idx}>{item.text || item}</li>
          ))}
        </ul>
      </div>`;

        case 'action':
          return `      <div className="feature feature-action">
        <button onClick={() => console.log('${f.name} clicked')}>
          {data.${key}.label}
        </button>
      </div>`;

        case 'badge':
          return `      <div className="feature feature-badge">
        <span style={{ backgroundColor: data.${key}.color }}>
          {data.${key}.label}
        </span>
      </div>`;

        default:
          return `      <div className="feature feature-text">
        <h3>${f.name}</h3>
        <p>{data.${key}}</p>
      </div>`;
      }
    })
    .join('\n\n');

  return `import React from 'react';
import './ProductDisplay.css';

export function ProductDisplay() {
  const [data] = React.useState(${mockDataString});

  return (
    <div className="product-display">
${featureRenders}
    </div>
  );
}`;
}

/**
 * Generate CSS code
 */
function generateCSSCode(): string {
  return `.product-display {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.feature {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-left: 4px solid #282c34;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.feature:hover {
  background: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feature h3 {
  margin: 0 0 0.75rem 0;
  font-size: 14px;
  color: #282c34;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.feature label {
  font-weight: 600;
  color: #282c34;
  margin-right: 0.5rem;
}

.feature .value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* Rating */
.feature-rating {
  border-left-color: #ffc107;
}

.rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stars {
  font-size: 24px;
  color: #ffc107;
  letter-spacing: 2px;
}

.rating-value {
  font-weight: 700;
  color: #282c34;
  font-size: 18px;
}

.rating-count {
  font-size: 14px;
  color: #999;
}

/* Number */
.feature-number {
  border-left-color: #2196f3;
}

/* Image */
.feature-image {
  border-left-color: #9c27b0;
}

.feature-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #ddd;
  display: block;
}

/* List */
.feature-list {
  border-left-color: #ff9800;
  padding-bottom: 0;
}

.feature-list ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.feature-list li {
  padding: 0.75rem 1rem;
  background: #fff;
  border-left: 3px solid #ff9800;
  margin-bottom: 0.5rem;
  border-radius: 3px;
  font-size: 15px;
  color: #333;
  transition: all 0.2s;
}

.feature-list li:hover {
  background: #fffbf0;
  transform: translateX(2px);
}

/* Action Button */
.feature-action {
  border-left-color: #4caf50;
  padding-bottom: 0;
}

.feature-action button {
  background: #282c34;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.feature-action button:hover {
  background: #3a3f47;
  box-shadow: 0 2px 8px rgba(40, 44, 52, 0.3);
}

.feature-action button:active {
  transform: scale(0.98);
}

/* Badge */
.feature-badge {
  border-left-color: #e91e63;
  padding-bottom: 0;
}

.feature-badge span {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 16px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 1rem;
}

/* Text */
.feature-text p {
  margin: 0.5rem 0 0 0;
  color: #666;
  line-height: 1.6;
  font-size: 15px;
}

/* Responsive */
@media (max-width: 768px) {
  .product-display {
    padding: 1rem;
  }

  .feature {
    padding: 1rem;
  }

  .rating {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .feature-image img {
    max-height: 250px;
  }
}`;
}

/**
 * Generate mock data for a feature type
 */
function generateMockForType(dataType: string): any {
  switch (dataType) {
    case 'rating':
      return { stars: 4.5, count: 2341 };
    case 'number':
      return 29.99;
    case 'image':
      return 'https://via.placeholder.com/300x200?text=Product';
    case 'list':
      return [
        { text: 'Feature item 1' },
        { text: 'Feature item 2' },
        { text: 'Feature item 3' },
      ];
    case 'action':
      return { label: 'Click Action' };
    case 'badge':
      return { label: 'New', color: '#4CAF50' };
    default:
      return 'Sample content';
  }
}
