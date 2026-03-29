#!/usr/bin/env node

const { register } = require('module');
const path = require('path');
const { pathToFileURL } = require('url');

// Register the loader for ESM path handling
try {
  register(
    pathToFileURL(path.join(__dirname, 'metro-wrapper.mjs')).href,
    { parentURL: pathToFileURL(__filename).href }
  );
} catch (e) {
  console.warn('Failed to register module loader:', e.message);
}

// Now require and run the expo CLI
require('@expo/cli');



