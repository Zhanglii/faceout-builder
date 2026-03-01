import React from 'react';
import { Feature } from '../services/analysisParser';
import { generateLayout, LayoutSection } from '../services/layoutEngine';
import './RenderableComponent.css';

interface RenderableComponentProps {
  features: Feature[];
  sourceImage?: string;
  title?: string;
}

/**
 * Render features using intelligent layout engine with actual extracted data
 * Shows product image prominently and uses real feature descriptions
 */
export function RenderableComponent({ features, sourceImage }: RenderableComponentProps) {
  const sections = generateLayout(features);
  const imageFeature = features.find(
    (f) => f.dataType === 'image' || /image|photo|thumbnail/i.test(f.name),
  );
  const titleFeature = findFeature(features, /title|product name|name/i);
  const priceFeature = findFeature(features, /price|cost|amount/i);
  const ratingFeature = features.find(f => f.dataType === 'rating');
  const imageUrl = extractImageUrl(imageFeature?.description);
  const ratingData = parseRating(ratingFeature?.description || '');

  return (
    <div className="renderable-component">
      <div className="product-page">
        {/* Hero Section: Image + Product Info */}
        <div className="product-hero">
          {imageUrl ? (
            <div className="hero-image">
              <img src={imageUrl} alt="Product" />
            </div>
          ) : (
            <div className="hero-image hero-image-placeholder">
              <div className="placeholder-text">
                Product Image
                <span className="placeholder-note">(Image extraction in progress)</span>
              </div>
            </div>
          )}
          <div className="hero-info">
            {titleFeature && (
              <h1 className="product-title">{titleFeature.description}</h1>
            )}
            {priceFeature && (
              <div className="product-price">{priceFeature.description}</div>
            )}
            {ratingFeature && ratingData && (
              <div className="product-rating">
                <span className="stars">
                  {'★'.repeat(Math.floor(ratingData.stars))}
                  {'☆'.repeat(Math.max(0, 5 - Math.floor(ratingData.stars)))}
                </span>
                <span className="rating-text">
                  {ratingData.stars} stars
                  {ratingData.count ? ` (${ratingData.count.toLocaleString()} reviews)` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="product-sections">
          {sections.map((section, idx) => (
            <div key={idx} className={`section section-${section.type}`}>
              {section.type !== 'hero' && renderSection(section)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Render section based on type
 */
function renderSection(section: LayoutSection): React.ReactNode {
  switch (section.type) {
    case 'highlighted':
      return renderHighlightedSection(section);
    case 'detailed':
      return renderDetailedSection(section);
    case 'list':
      return renderListSection(section);
    case 'grid':
      return renderGridSection(section);
    case 'actions':
      return renderActionsSection(section);
    default:
      return renderDetailedSection(section);
  }
}

/**
 * Highlighted section - Key metrics
 */
function renderHighlightedSection(section: LayoutSection): React.ReactNode {
  return (
    <div className="highlighted-section">
      <div className="highlight-grid">
        {section.features.map((f, idx) => (
          <div key={idx} className="highlight-box">
            <div className="highlight-label">{f.name}</div>
            <div className="highlight-value">{f.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Detailed section - Descriptions and specs
 */
function renderDetailedSection(section: LayoutSection): React.ReactNode {
  // Filter out hero content which is already shown above
  const filtered = section.features.filter(
    f =>
      !/title|product name|name/i.test(f.name) &&
      !/price|cost|amount/i.test(f.name) &&
      f.dataType !== 'rating' &&
      f.dataType !== 'image'
  );

  return (
    <div className="detailed-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      {filtered.map((f, idx) => (
        <div key={idx} className="detail-box">
          <h3 className="detail-heading">{f.name}</h3>
          <p className="detail-text">{f.description}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * List section - Features with checkmarks
 */
function renderListSection(section: LayoutSection): React.ReactNode {
  return (
    <div className="list-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <ul className="feature-list">
        {section.features.flatMap((f, idx) => {
          const listItems = splitListItems(f.description);
          if (listItems.length > 1) {
            return listItems.map((item, itemIdx) => (
              <li key={`${idx}-${itemIdx}`}>
                <span className="checkmark">✓</span>
                {item}
              </li>
            ));
          }
          return (
            <li key={idx}>
              <span className="checkmark">✓</span>
              {f.description}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Grid section - Color/size options
 */
function renderGridSection(section: LayoutSection): React.ReactNode {
  return (
    <div className="grid-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      {section.features.map((f, idx) => (
        <div key={idx} className="option-box">
          <label className="option-label">{f.name}</label>
          {splitOptionItems(f.description).length > 1 ? (
            <div className="option-buttons">
              {splitOptionItems(f.description).map((item, itemIdx) => (
                <button key={itemIdx} className="option-btn">
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <p className="option-value">{f.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Actions section - Call-to-action buttons
 */
function renderActionsSection(section: LayoutSection): React.ReactNode {
  return (
    <div className="actions-section">
      {section.features.map((f, idx) => (
        <button
          key={idx}
          className={`cta-btn ${idx === 0 ? 'primary' : 'secondary'}`}
          onClick={() => console.log(f.name)}
        >
          {f.description || f.name}
        </button>
      ))}
    </div>
  );
}

function findFeature(features: Feature[], pattern: RegExp): Feature | undefined {
  return features.find((f) => pattern.test(f.name));
}

function extractImageUrl(value?: string): string | undefined {
  if (!value) return undefined;
  const dataUriMatch = value.match(/data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+/);
  if (dataUriMatch?.[0]) return dataUriMatch[0];

  const urlMatch = value.match(/https?:\/\/[^\s)]+/i);
  if (!urlMatch?.[0]) return undefined;
  return /via\.placeholder\.com/i.test(urlMatch[0]) ? undefined : urlMatch[0];
}

function parseRating(value: string): { stars: number; count?: number } | null {
  if (!value) return null;
  const starsMatch = value.match(/(\d+(?:\.\d+)?)/);
  if (!starsMatch) return null;

  const stars = Number(starsMatch[1]);
  if (Number.isNaN(stars)) return null;

  const countMatch = value.match(/([\d,]+)\s*(?:reviews?|ratings?)/i);
  const count = countMatch ? Number(countMatch[1].replace(/,/g, '')) : undefined;
  return { stars, count: Number.isNaN(count as number) ? undefined : count };
}

function splitListItems(value: string): string[] {
  if (!value) return [];
  if (value.includes('•')) {
    return value.split('•').map((x) => x.trim()).filter(Boolean);
  }
  if (value.includes(';')) {
    return value.split(';').map((x) => x.trim()).filter(Boolean);
  }
  return [value.trim()].filter(Boolean);
}

function splitOptionItems(value: string): string[] {
  if (!value) return [];
  if (value.includes(',')) {
    return value.split(',').map((x) => x.trim()).filter(Boolean);
  }
  if (value.includes('/')) {
    return value.split('/').map((x) => x.trim()).filter(Boolean);
  }
  return [value.trim()].filter(Boolean);
}
