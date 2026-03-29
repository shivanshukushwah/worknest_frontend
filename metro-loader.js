#!/usr/bin/env node
/**
 * Metro config loader to work around Node 22 ESM URL scheme issues on Windows
 * This script loads the metro config using require() instead of dynamic import
 */

const path = require('path');
const Module = require('module');

// Cache the metro config
const metroConfigPath = path.join(__dirname, 'metro.config.js');
const metroConfig = require(metroConfigPath);

module.exports = metroConfig;

// If run directly, start expo with the config
if (require.main === module) {
  const { spawn } = require('child_process');
  const expo = spawn('npx', ['expo', 'start', ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
  });

  expo.on('close', (code) => {
    process.exit(code);
  });
}
