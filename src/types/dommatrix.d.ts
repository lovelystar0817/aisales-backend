declare module '@thednp/dommatrix' {
  class DOMMatrixPolyfill {
    constructor(init?: string | number[]);
    multiplySelf(other?: DOMMatrixPolyfill): DOMMatrixPolyfill;
    translateSelf(x?: number, y?: number, z?: number): DOMMatrixPolyfill;
    scaleSelf(x?: number, y?: number, z?: number): DOMMatrixPolyfill;
    rotateSelf(rotX?: number, rotY?: number, rotZ?: number): DOMMatrixPolyfill;
    skewXSelf(sx?: number): DOMMatrixPolyfill;
    skewYSelf(sy?: number): DOMMatrixPolyfill;
    invertSelf(): DOMMatrixPolyfill;
    setMatrixValue(value: string): DOMMatrixPolyfill;
  }

  export default DOMMatrixPolyfill;
}
