/**
 * Parse analysis output to extract structured feature data
 */

export interface Feature {
  name: string;
  description: string;
  dataType: 'text' | 'number' | 'image' | 'rating' | 'list' | 'action' | 'badge' | 'other';
  position?: string;
  styling?: string;
  apiSource?: string;
  isMVP?: boolean;
  mockData?: any;
}

export interface AnalysisStructure {
  features: Feature[];
  apiDependencies: string[];
  rawAnalysis: string;
}

function cleanExtractedValue(value: string): string {
  return value
    .replace(/^[-*]\s*/, '')
    .replace(/^"|"$/g, '')
    .replace(/^'|'$/g, '')
    .replace(/\*\*/g, '')
    .trim();
}

function extractField(block: string, labels: string[]): string {
  for (const label of labels) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(?:^|\\n)\\s*[-*]?\\s*\\*?\\*?${escapedLabel}\\*?\\*?\\s*:\\s*([^\\n]+)`,
      'i',
    );
    const match = block.match(pattern);
    if (match?.[1]) {
      return cleanExtractedValue(match[1]);
    }
  }
  return '';
}

/**
 * Extract feature blocks from markdown analysis
 */
function extractFeatureBlocks(text: string): string[] {
  // Match ### [Feature Name] sections
  const featurePattern = /###\s+\[?([^\n\]]+)\]?[\n\r]+([\s\S]*?)(?=###\s+\[?|## Data Dependencies|$)/g;
  const blocks: string[] = [];
  let match;
  
  while ((match = featurePattern.exec(text)) !== null) {
    blocks.push(`### ${match[1]}\n${match[2]}`);
  }
  
  return blocks;
}

/**
 * Parse individual feature block
 */
function parseFeature(block: string): Feature | null {
  const nameMatch = block.match(/###\s+\[?([^\n\]]+)\]?/);
  if (!nameMatch) return null;

  const name = nameMatch[1].trim();
  const description = extractField(block, ['Description']);
  const dataDisplayed = extractField(block, ['Data displayed', 'Data Displayed', 'Data shown', 'Displayed data']);
  const dataTypeRaw = extractField(block, ['Data type', 'Type']);
  const position = extractField(block, ['Position']);
  const styling = extractField(block, ['Visual styling', 'Styling']);
  const apiSource = extractField(block, ['Likely API/source', 'Likely source', 'Source']);
  const isMVPMatch = block.match(/\*\*Required for implementation\*\*:\s*(Yes|No)/i);

  // Use explicit dataType from markdown or infer from keywords
  let dataType: Feature['dataType'] = 'text';
  if (dataTypeRaw) {
    const typeNormalized = dataTypeRaw.toLowerCase();
    if (typeNormalized === 'action' || typeNormalized === 'button') {
      dataType = 'action';
    } else if (typeNormalized === 'rating' || typeNormalized === 'review') {
      dataType = 'rating';
    } else if (typeNormalized === 'image' || typeNormalized === 'photo') {
      dataType = 'image';
    } else if (typeNormalized === 'price' || typeNormalized === 'number') {
      dataType = 'number';
    } else if (typeNormalized === 'list') {
      dataType = 'list';
    } else if (typeNormalized === 'badge' || typeNormalized === 'label') {
      dataType = 'badge';
    }
  } else {
    // Fallback: Detect data type from keywords
    if (
      name.toLowerCase().includes('rating') ||
      name.toLowerCase().includes('star') ||
      dataDisplayed.toLowerCase().includes('out of 5')
    ) {
      dataType = 'rating';
    } else if (name.toLowerCase().includes('image') || name.toLowerCase().includes('photo')) {
      dataType = 'image';
    } else if (name.toLowerCase().includes('price') || name.toLowerCase().includes('count')) {
      dataType = 'number';
    } else if (name.toLowerCase().includes('review') || name.toLowerCase().includes('list')) {
      dataType = 'list';
    } else if (name.toLowerCase().includes('button') || name.toLowerCase().includes('action') || name.toLowerCase().includes('cart') || name.toLowerCase().includes('add to')) {
      dataType = 'action';
    } else if (name.toLowerCase().includes('badge') || name.toLowerCase().includes('label')) {
      dataType = 'badge';
    }
  }

  return {
    name,
    description: dataDisplayed || description,
    dataType,
    position,
    styling,
    apiSource,
    isMVP: isMVPMatch ? isMVPMatch[1].toLowerCase() === 'yes' : true,
    mockData: generateMockData(dataType, name),
  };
}

/**
 * Generate mock data based on feature type
 */
function generateMockData(dataType: Feature['dataType'], name: string): any {
  switch (dataType) {
    case 'rating':
      return { stars: 4.5, count: 2341 };
    case 'number':
      return name.toLowerCase().includes('price') ? 29.99 : 1234;
    case 'image':
      return 'https://via.placeholder.com/300x200?text=Product+Image';
    case 'list':
      return [
        { id: 1, text: 'Sample item 1' },
        { id: 2, text: 'Sample item 2' },
        { id: 3, text: 'Sample item 3' },
      ];
    case 'action':
      return { label: 'Click Action', onClick: () => console.log('Action clicked') };
    case 'badge':
      return { label: 'New', color: '#4CAF50' };
    default:
      return name.includes('title') ? 'Sample Product Title' : 'Sample content';
  }
}

/**
 * Extract API dependencies from analysis
 */
function extractApiDependencies(text: string): string[] {
  const depsMatch = text.match(/## Data Dependencies Map([\s\S]*?)(?=##|$)/);
  if (!depsMatch) return [];

  const depsSection = depsMatch[1];
  const apiPattern = /[-•]\s*([A-Za-z\s/]+API|[A-Za-z\s]+API|[A-Za-z\s]+Database)/g;
  const apis: string[] = [];
  let match;

  while ((match = apiPattern.exec(depsSection)) !== null) {
    const api = match[1].trim();
    if (api && !apis.includes(api)) {
      apis.push(api);
    }
  }

  return apis;
}

/**
 * Main parser function
 */
export function parseAnalysis(analysisText: string): AnalysisStructure {
  const featureBlocks = extractFeatureBlocks(analysisText);
  const features = featureBlocks
    .map(block => parseFeature(block))
    .filter((f): f is Feature => f !== null);

  const apiDependencies = extractApiDependencies(analysisText);

  return {
    features,
    apiDependencies,
    rawAnalysis: analysisText,
  };
}
