/**
 * Polyfills for browser APIs required by pdfjs-dist in Node.js environment
 * These are minimal implementations that satisfy pdfjs-dist's requirements
 * for text extraction without requiring full browser API implementations.
 */

// Polyfill DOMMatrix using @thednp/dommatrix
import DOMMatrixPolyfill from '@thednp/dommatrix';

// Type augmentation for globalThis
declare global {
  // eslint-disable-next-line no-var
  var DOMMatrix: typeof DOMMatrixPolyfill;
  // eslint-disable-next-line no-var
  var ImageData: new (
    dataOrWidth: Uint8ClampedArray | number,
    widthOrHeight?: number,
    height?: number,
  ) => {
    data: Uint8ClampedArray;
    width: number;
    height: number;
  };
  // eslint-disable-next-line no-var
  var Path2D: new (path?: any) => {
    // Minimal implementation
  };
}

// Set up global DOMMatrix if not already available
if (typeof globalThis.DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
}

// Polyfill ImageData - minimal implementation for pdfjs-dist
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(
      dataOrWidth: Uint8ClampedArray | number,
      widthOrHeight?: number,
      height?: number,
    ) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth;
        this.width = widthOrHeight!;
        this.height = height!;
      } else {
        this.width = dataOrWidth;
        this.height = widthOrHeight!;
        this.data = new Uint8ClampedArray(dataOrWidth * widthOrHeight! * 4);
      }
    }
  };
}

// Polyfill Path2D - minimal implementation for pdfjs-dist
if (typeof globalThis.Path2D === 'undefined') {
  (globalThis as any).Path2D = class Path2D {
    // Minimal implementation - pdfjs-dist only needs the constructor
    constructor(path?: Path2D | string) {
      // Stub implementation
    }
  };
}

// Ensure these are available on the global scope for pdfjs-dist
export {};
