import { Feature } from './analysisParser';

export interface LayoutSection {
  type: 'hero' | 'grid' | 'list' | 'actions' | 'detailed' | 'highlighted';
  title?: string;
  features: Feature[];
  layout?: 'horizontal' | 'vertical' | 'grid';
}

/**
 * Intelligent layout engine that groups features into semantic sections
 * and applies optimal rendering templates
 */
export function generateLayout(features: Feature[]): LayoutSection[] {
  const sections: LayoutSection[] = [];
  const processed = new Set<number>();

  // 1. Hero Section - Title, Price, Rating (top priority, large impact)
  const heroFeatures = features
    .map((f, i) => ({ f, i }))
    .filter(
      ({ f }) =>
        f.name.toLowerCase().includes('title') ||
        f.name.toLowerCase().includes('price') ||
        f.name.toLowerCase().includes('rating') ||
        f.name.toLowerCase().includes('star'),
    )
    .slice(0, 3);

  if (heroFeatures.length > 0) {
    sections.push({
      type: 'hero',
      features: heroFeatures.map((x) => {
        processed.add(x.i);
        return x.f;
      }),
    });
  }

  // 2. Highlighted Section - Key metrics (reviews, availability, stock)
  const highlightedFeatures = features
    .map((f, i) => ({ f, i }))
    .filter(
      ({ i, f }) =>
        !processed.has(i) &&
        (f.name.toLowerCase().includes('review') ||
          f.name.toLowerCase().includes('available') ||
          f.name.toLowerCase().includes('stock') ||
          f.name.toLowerCase().includes('in stock')),
    )
    .slice(0, 3);

  if (highlightedFeatures.length > 0) {
    sections.push({
      type: 'highlighted',
      features: highlightedFeatures.map((x) => {
        processed.add(x.i);
        return x.f;
      }),
      layout: 'horizontal',
    });
  }

  // 3. Detailed Section - Description, specifications
  const detailedFeatures = features
    .map((f, i) => ({ f, i }))
    .filter(
      ({ i, f }) =>
        !processed.has(i) &&
        (f.name.toLowerCase().includes('description') ||
          f.name.toLowerCase().includes('about') ||
          f.name.toLowerCase().includes('specification') ||
          f.dataType === 'text'),
    )
    .slice(0, 2);

  if (detailedFeatures.length > 0) {
    sections.push({
      type: 'detailed',
      title: 'About This Product',
      features: detailedFeatures.map((x) => {
        processed.add(x.i);
        return x.f;
      }),
    });
  }

  // 4. Features/Benefits List - Bullet points
  const listFeatures = features
    .map((f, i) => ({ f, i }))
    .filter(
      ({ i, f }) =>
        !processed.has(i) &&
        (f.dataType === 'list' ||
          f.name.toLowerCase().includes('feature') ||
          f.name.toLowerCase().includes('benefit') ||
          f.name.toLowerCase().includes('key')),
    );

  if (listFeatures.length > 0) {
    sections.push({
      type: 'list',
      title: 'Key Features',
      features: listFeatures.map((x) => {
        processed.add(x.i);
        return x.f;
      }),
    });
  }

  // 5. Grid Section - Options (colors, sizes, variants)
  const gridFeatures = features
    .map((f, i) => ({ f, i }))
    .filter(
      ({ i, f }) =>
        !processed.has(i) &&
        (f.name.toLowerCase().includes('color') ||
          f.name.toLowerCase().includes('size') ||
          f.name.toLowerCase().includes('option') ||
          f.name.toLowerCase().includes('variant') ||
          f.name.toLowerCase().includes('available')),
    );

  if (gridFeatures.length > 0) {
    sections.push({
      type: 'grid',
      title: 'Options',
      features: gridFeatures.map((x) => {
        processed.add(x.i);
        return x.f;
      }),
      layout: 'horizontal',
    });
  }

  // 6. Actions Section - Buttons (buy, add to cart, wishlist)
  const actionFeatures = features
    .map((f, i) => ({ f, i }))
    .filter(
      ({ i, f }) =>
        !processed.has(i) &&
        (f.dataType === 'action' ||
          f.name.toLowerCase().includes('button') ||
          f.name.toLowerCase().includes('add') ||
          f.name.toLowerCase().includes('buy') ||
          f.name.toLowerCase().includes('cart') ||
          f.name.toLowerCase().includes('wishlist')),
    );

  if (actionFeatures.length > 0) {
    sections.push({
      type: 'actions',
      features: actionFeatures.map((x) => {
        processed.add(x.i);
        return x.f;
      }),
      layout: 'horizontal',
    });
  }

  // 7. Remaining features in a final section
  const remainingFeatures = features
    .map((f, i) => ({ f, i }))
    .filter(({ i }) => !processed.has(i));

  if (remainingFeatures.length > 0) {
    sections.push({
      type: 'detailed',
      title: 'Additional Information',
      features: remainingFeatures.map((x) => {
        processed.add(x.i);
        return x.f;
      }),
    });
  }

  return sections;
}
