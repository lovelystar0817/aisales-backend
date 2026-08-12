// ESM loader for TypeScript files
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';
import { transformSync } from 'esbuild';

const require = createRequire(import.meta.url);
const baseURL = pathToFileURL(process.cwd()).href;

// Resolve file extension-less imports by trying various extensions
export async function resolve(specifier, context, nextResolve) {
  const { parentURL = baseURL } = context;
  
  // Node.js normally errors if trying to use TypeScript
  if (specifier.endsWith('.ts') || specifier.endsWith('.tsx')) {
    const url = new URL(specifier, parentURL).href;
    return { url, shortCircuit: true };
  }
  
  // Try to handle extension-less imports for TypeScript files
  if (!specifier.startsWith('node:') && 
      !specifier.startsWith('./') && 
      !specifier.startsWith('../') &&
      !specifier.startsWith('file:') &&
      !specifier.startsWith('https:') &&
      !specifier.includes(':')) {
    try {
      // Try normal resolution first
      return await nextResolve(specifier, context, nextResolve);
    } catch (error) {
      // If error, try to add extensions
      try {
        const resolved = await nextResolve(specifier + '.js', context, nextResolve);
        return resolved;
      } catch (error) {
        // Continue to next extension
      }
      
      try {
        const resolved = await nextResolve(specifier + '.ts', context, nextResolve);
        return resolved;
      } catch (error) {
        // Continue to next extension
      }
    }
  }
  
  // For relative imports, try resolving with extensions
  if ((specifier.startsWith('./') || specifier.startsWith('../'))) {
    try {
      return await nextResolve(specifier, context, nextResolve);
    } catch (error) {
      // If the import doesn't have an extension, try .ts
      if (!path.extname(specifier)) {
        try {
          return await nextResolve(`${specifier}.ts`, context, nextResolve);
        } catch (error) {
          try {
            return await nextResolve(`${specifier}.js`, context, nextResolve);
          } catch (error) {
            // Let the original error propagate
          }
        }
      }
    }
  }

  // Let the next resolver handle it
  return nextResolve(specifier, context, nextResolve);
}

// Transform TypeScript files to JavaScript
export async function load(url, context, nextLoad) {
  const { format } = context;
  
  // Only process TypeScript files
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const source = await nextLoad(url, { ...context, format: 'module' }).then(
      result => result.source
    );
    
    // Transform TypeScript to JavaScript using esbuild
    const { code } = transformSync(source.toString(), {
      loader: 'ts',
      target: 'es2020',
      format: 'esm',
      tsconfigRaw: {
        compilerOptions: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          target: 'ES2022',
          esModuleInterop: true,
        }
      },
    });
    
    return {
      format: 'module',
      source: code,
      shortCircuit: true,
    };
  }
  
  // For all other files, use the default loader
  return nextLoad(url, context);
}
