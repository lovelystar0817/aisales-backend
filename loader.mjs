// Custom TypeScript ESM loader for tests
import { transformSync } from 'esbuild';
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

// Register hook to import TypeScript files
export async function resolve(specifier, context, nextResolve) {
  // Handle TypeScript file extensions
  if (specifier.endsWith('.ts') || specifier.endsWith('.tsx')) {
    const { parentURL = null } = context;
    const url = parentURL ? new URL(specifier, parentURL).href : specifier;
    return { url, shortCircuit: true };
  }
  
  // Handle extension-less imports
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    try {
      return await nextResolve(specifier, context, nextResolve);
    } catch (error) {
      // If no extension is specified, try with .ts extension
      if (!path.extname(specifier)) {
        try {
          return await nextResolve(`${specifier}.ts`, context, nextResolve);
        } catch (tsError) {
          try {
            return await nextResolve(`${specifier}.js`, context, nextResolve);
          } catch (jsError) {
            // Let original error propagate
          }
        }
      }
    }
  }
  
  // For all other imports, use default resolver
  return nextResolve(specifier, context, nextResolve);
}

// Transform TypeScript files to JavaScript
export async function load(url, context, nextLoad) {
  // Only handle TypeScript files
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const filePath = fileURLToPath(url);
    const content = readFileSync(filePath, 'utf8');
    
    // Use esbuild to transpile TypeScript to JavaScript
    const { code } = transformSync(content, {
      loader: 'ts',
      format: 'esm',
      target: 'esnext',
      sourcemap: 'inline',
    });
    
    return {
      format: 'module',
      source: code,
      shortCircuit: true,
    };
  }
  
  // Use default loader for other files
  return nextLoad(url, context, nextLoad);
}
