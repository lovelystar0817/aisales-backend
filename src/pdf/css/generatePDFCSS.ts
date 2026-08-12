import fs from 'fs';
import path from 'path';

interface FontConfig {
  family: string;
  style: string;
  weight: number;
  filename: string;
  format: 'opentype' | 'truetype';
  unicodeRange?: string; // Optional unicode range for CJK fonts
  isCJKFont?: boolean; // Mark CJK fonts to be loaded separately
}

const fontConfigs: FontConfig[] = [
  {
    family: 'TWK Everett',
    style: 'normal',
    weight: 400,
    filename: 'twk-everett/TWKEverett-Regular.otf',
    format: 'opentype',
  },
  {
    family: 'TWK Everett',
    style: 'normal',
    weight: 500,
    filename: 'twk-everett/TWKEverett-Medium.otf',
    format: 'opentype',
  },
  {
    family: 'TWK Everett',
    style: 'normal',
    weight: 700,
    filename: 'twk-everett/TWKEverett-Bold.otf',
    format: 'opentype',
  },
  {
    family: 'CircularXX',
    style: 'normal',
    weight: 300,
    filename: 'circular-xx/CircularStd-Book.otf',
    format: 'opentype',
  },
  {
    family: 'CircularXX',
    style: 'normal',
    weight: 400,
    filename: 'circular-xx/CircularStd-Book.otf',
    format: 'opentype',
  },
  {
    family: 'CircularXX',
    style: 'normal',
    weight: 500,
    filename: 'circular-xx/circular-std-medium-500.ttf',
    format: 'truetype',
  },
  {
    family: 'CircularXX',
    style: 'normal',
    weight: 700,
    filename: 'circular-xx/CircularXX-Bold.otf',
    format: 'opentype',
  },
  // Add Segoe UI fonts that support Thai characters
  {
    family: 'Segoe UI',
    style: 'normal',
    weight: 400,
    filename: 'segoe/Segoe UI.ttf',
    format: 'truetype',
  },
  {
    family: 'Segoe UI',
    style: 'normal',
    weight: 700,
    filename: 'segoe/Segoe UI Bold.ttf',
    format: 'truetype',
  },
  // Add Noto Sans TC for Traditional Chinese (Taiwan) support
  // Loaded separately via page.addStyleTag() to avoid HTML parsing bottleneck
  {
    family: 'Noto Sans TC',
    style: 'normal',
    weight: 400,
    filename: 'noto-sans-tc/NotoSansTC-Regular.ttf',
    format: 'truetype',
    isCJKFont: true,
    unicodeRange:
      'U+4E00-9FFF, U+3400-4DBF, U+F900-FAFF, U+2F00-2FDF, U+3000-303F, U+FF00-FFEF, U+2000-206F',
  },
];

// Cache for base64 encoded fonts
const fontBase64Cache: Map<string, string> = new Map();

function getFontAsBase64(filename: string): string {
  if (fontBase64Cache.has(filename)) {
    return fontBase64Cache.get(filename)!;
  }

  try {
    const fontPath = path.resolve(process.cwd(), 'public/fonts', filename);
    const fontBuffer = fs.readFileSync(fontPath);
    const base64 = fontBuffer.toString('base64');
    fontBase64Cache.set(filename, base64);
    return base64;
  } catch (error) {
    console.error(`Failed to read font file ${filename}:`, error);
    return '';
  }
}

/**
 * Generate the main PDF CSS without CJK fonts
 * CJK fonts should be injected separately via page.addStyleTag() to avoid
 * HTML parsing bottleneck with large base64 strings
 */
export function generatePdfCss(
  baseUrl?: string,
  useLocalPaths?: boolean,
): string {
  // Get the local fonts directory path for file:// URLs
  const localFontsDir = path.resolve(process.cwd(), 'public/fonts');

  // Filter out CJK fonts - they will be loaded separately
  const nonCJKFonts = fontConfigs.filter((config) => !config.isCJKFont);

  const fontFaces = nonCJKFonts
    .map((config) => {
      const unicodeRangeLine = config.unicodeRange
        ? `\n  unicode-range: ${config.unicodeRange};`
        : '';

      // Use local file:// paths for PDF generation (more reliable with Puppeteer)
      // Use HTTP URLs for web serving
      const fontUrl = useLocalPaths
        ? `file://${localFontsDir}/${config.filename}`
        : `${baseUrl}/fonts/${config.filename}`;

      return `
@font-face {
  font-family: '${config.family}';
  font-style: ${config.style};
  font-weight: ${config.weight};
  src: url('${fontUrl}') format('${config.format}');
  font-display: block;${unicodeRangeLine}
}`;
    })
    .join('\n');

  const customCss = `
/* Generated PDF CSS with dynamic font URLs */
${fontFaces}

/* CSS Variables */
:root {
  --font-everett: 'TWK Everett', 'Noto Sans TC', 'Segoe UI', 'DejaVu Sans', 'Liberation Sans', sans-serif;
  --font-sans: 'CircularXX', 'Noto Sans TC', 'Segoe UI', 'DejaVu Sans', 'Liberation Sans', sans-serif;
  
  --color-primary-400: #e8683b;
  --color-primary-500: #fe4a0b;
  --color-primary-600: #d64a19;
  --color-primary: #fe4a0b;
  
  --color-gray-500: #58595a;
}

/* PDF-specific styles */
body {
  font-family: var(--font-sans);
  margin: 0;
  padding: 0;
  line-height: 1.6;
  -webkit-print-color-adjust: exact !important;
  color-adjust: exact !important;
}

@page {
  margin: 0;
  size: A4;
}

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-print-color-adjust: exact !important;
  color-adjust: exact !important;
}

/* Improved paragraph and text spacing */
p {
  line-height: 1.6 !important;
  margin-bottom: 1rem;
}

/* Bullet point spacing */
li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

/* General text content spacing */
.text-content {
  line-height: 1.6;
}

/* Force background colors to print */
.bg-\\[\\#EFEFEF\\] {
  background-color: #EFEFEF !important;
  -webkit-print-color-adjust: exact !important;
  color-adjust: exact !important;
}
`;

  return customCss;
}

// Cache for CJK font CSS to avoid regenerating on every request
let cjkFontCssCache: string | null = null;

/**
 * Generate CSS for CJK fonts with base64 embedding
 * This should be injected separately via page.addStyleTag() after setContent()
 * to avoid the HTML parsing bottleneck with large base64 strings (~7MB)
 */
export function getCJKFontCss(): string {
  // Return cached version if available
  if (cjkFontCssCache) {
    return cjkFontCssCache;
  }

  const cjkFonts = fontConfigs.filter((config) => config.isCJKFont);

  const fontFaces = cjkFonts
    .map((config) => {
      const unicodeRangeLine = config.unicodeRange
        ? `\n  unicode-range: ${config.unicodeRange};`
        : '';

      const base64Data = getFontAsBase64(config.filename);
      if (!base64Data) {
        console.error(`Failed to load CJK font: ${config.filename}`);
        return '';
      }

      return `
@font-face {
  font-family: '${config.family}';
  font-style: ${config.style};
  font-weight: ${config.weight};
  src: url('data:font/${config.format === 'truetype' ? 'ttf' : 'otf'};base64,${base64Data}') format('${config.format}');
  font-display: block;${unicodeRangeLine}
}`;
    })
    .filter(Boolean)
    .join('\n');

  cjkFontCssCache = fontFaces;
  return fontFaces;
}
