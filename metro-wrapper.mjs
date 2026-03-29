/**
 * ESM Hook Loader for Node.js 22+
 * Handles Windows path to file:// URL conversion for metro config loading
 */

import { pathToFileURL, fileURLToPath } from 'url';

export async function resolve(specifier, context, nextResolve) {
  let resolvedSpecifier = specifier;
  
  // Convert Windows absolute paths to file:// URLs
  if (typeof specifier === 'string' && /^[A-Za-z]:/.test(specifier)) {
    try {
      resolvedSpecifier = pathToFileURL(specifier).href;
    } catch (err) {
      // If conversion fails, continue with original
    }
  }
  
  return nextResolve(resolvedSpecifier, context);
}

export async function getFormat(url, context, nextGetFormat) {
  // Return format for the URL
  return nextGetFormat(url, context);
}

export async function getSource(url, context, nextGetSource) {
  return nextGetSource(url, context);
}

export async function transformSource(source, context, nextTransformSource) {
  return nextTransformSource(source, context);
}

export async function load(url, context, nextLoad) {
  return nextLoad(url, context);
}




