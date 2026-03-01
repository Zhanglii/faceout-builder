import { Feature } from './analysisParser';

/**
 * Generate complete React component code from parsed features
 */
export function generateComponentCode(features: Feature[], componentName: string = 'ProductDisplay'): string {
  const imports = `import React from 'react';
import './ProductDisplay.css';`;

  const mockDataCode = generateMockData(features);
  
  const componentCode = `export function ${componentName}() {
  const [data] = React.useState(${mockDataCode});

  return (
    <div className="product-display">
      ${features.map((f, i) => generateFeatureJSX(f, i)).join('\n      ')}
    </div>
  );
}`;

  return `${imports}

${componentCode}`;
}

/**
 * Generate mock data object for all features
 */
function generateMockData(features: Feature[]): string {
  const dataObj: Record<string, any> = {};
  
  features.forEach(f => {
    const key = f.name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w]/g, '');
    
    dataObj[key] = f.mockData || generateDefaultMockForType(f.dataType, f.name);
  });

  return JSON.stringify(dataObj, null, 2);
}

/**
 * Generate JSX for a single feature
 */
function generateFeatureJSX(feature: Feature, index: number): string {
  const dataKey = feature.name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '');

  switch (feature.dataType) {
    case 'rating':
      return `<div className="feature feature-rating">
        <h3>${feature.name}</h3>
        <div className="rating">
          <span className="stars">{"★".repeat(Math.floor(data.${dataKey}.stars))}{"☆".repeat(5 - Math.floor(data.${dataKey}.stars))}</span>
          <span className="rating-value">{data.${dataKey}.stars}</span>
          <span className="rating-count">({data.${dataKey}.count} reviews)</span>
        </div>
      </div>`;

    case 'number':
      return `<div className="feature feature-number">
        <label>${feature.name}:</label>
        <span className="value">{data.${dataKey}}</span>
      </div>`;

    case 'image':
      return `<div className="feature feature-image">
        <h3>${feature.name}</h3>
        <img src={data.${dataKey}} alt="${feature.name}" />
      </div>`;

    case 'list':
      return `<div className="feature feature-list">
        <h3>${feature.name}</h3>
        <ul>
          {data.${dataKey}.map((item, idx) => (
            <li key={idx}>{item.text || item}</li>
          ))}
        </ul>
      </div>`;

    case 'action':
      return `<div className="feature feature-action">
        <button onClick={() => console.log('${feature.name} clicked')}>
          {data.${dataKey}.label}
        </button>
      </div>`;

    case 'badge':
      return `<div className="feature feature-badge">
        <span style={{ backgroundColor: data.${dataKey}.color }}>
          {data.${dataKey}.label}
        </span>
      </div>`;

    default:
      return `<div className="feature feature-text">
        <h3>${feature.name}</h3>
        <p>{data.${dataKey}}</p>
      </div>`;
  }
}

/**
 * Generate default mock data based on feature type
 */
function generateDefaultMockForType(dataType: string, name: string): any {
  switch (dataType) {
    case 'rating':
      return { stars: 4.5, count: 2341 };
    case 'number':
      return name.toLowerCase().includes('price') ? 29.99 : 1234;
    case 'image':
      return 'https://via.placeholder.com/300x200?text=Product+Image';
    case 'list':
      return [
        { text: 'Item 1' },
        { text: 'Item 2' },
        { text: 'Item 3' },
      ];
    case 'action':
      return { label: 'Click Action' };
    case 'badge':
      return { label: 'New', color: '#4CAF50' };
    default:
      return 'Sample content';
  }
}

/**
 * Generate CSS for the component
 */
export function generateComponentCSS(): string {
  return `.product-display {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.feature {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-left: 4px solid #282c34;
  border-radius: 4px;
}

.feature h3 {
  margin: 0 0 0.5rem 0;
  font-size: 16px;
  color: #282c34;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature .value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.feature-rating {
  border-left-color: #ffc107;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stars {
  font-size: 20px;
  color: #ffc107;
  letter-spacing: 2px;
}

.rating-value {
  font-weight: 600;
  color: #282c34;
}

.rating-count {
  font-size: 13px;
  color: #999;
}

.feature-number {
  border-left-color: #2196f3;
}

.feature-image {
  border-left-color: #9c27b0;
}

.feature-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  margin-top: 0.5rem;
  border: 1px solid #ddd;
}

.feature-list {
  border-left-color: #ff9800;
}

.feature-list ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.feature-list li {
  padding: 0.5rem 0.75rem;
  background: #fff;
  border-left: 3px solid #ff9800;
  margin: 0.25rem 0;
  border-radius: 2px;
}

.feature-action {
  border-left-color: #4caf50;
}

.feature-action button {
  background: #282c34;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.feature-action button:hover {
  background: #3a3f47;
}

.feature-badge {
  border-left-color: #e91e63;
}

.feature-badge span {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-text p {
  margin: 0.5rem 0 0 0;
  color: #666;
  line-height: 1.6;
}`;
}
