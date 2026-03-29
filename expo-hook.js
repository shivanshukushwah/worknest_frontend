const Module = require('module');
const path = require('path');
const originalRequire = Module.prototype.require;

// Patch require to handle metro.config.js specially
Module.prototype.require = function(id) {
  // If loading metro.config, ensure it's loaded properly
  if (id.includes('metro.config')) {
    return originalRequire.call(this, './metro.config.js');
  }
  return originalRequire.call(this, id);
};

// Now load and start expo
require('expo-cli/build/bin/cli');
