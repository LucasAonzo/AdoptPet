/**
 * Script to clear React Native Metro Bundler cache
 * Run with: node clear-cache.js
 */
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

console.log('🧹 Cleaning React Native cache...');

// Clear Metro bundler cache
try {
  console.log('Clearing Metro bundler cache...');
  childProcess.execSync('npx react-native start --reset-cache', {
    stdio: 'inherit',
  });
} catch (error) {
  console.log('Could not reset Metro cache:', error.message);
  console.log('Trying alternative method...');
}

// Clear Watchman cache
try {
  console.log('Clearing Watchman cache...');
  childProcess.execSync('watchman watch-del-all', {
    stdio: 'inherit',
  });
} catch (error) {
  console.log('Watchman command failed, might not be installed:', error.message);
}

// Delete node_modules/.cache if it exists
const cacheDir = path.join(__dirname, 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  console.log('Removing node_modules/.cache...');
  fs.rmSync(cacheDir, { recursive: true, force: true });
}

// Delete the temp directories
const tempDirs = [
  path.join(require('os').tmpdir(), 'metro-bundler-cache'),
  path.join(require('os').tmpdir(), 'react-native-packager-cache'),
  path.join(require('os').tmpdir(), 'haste-map-react-native-packager'),
];

tempDirs.forEach((dir) => {
  try {
    if (fs.existsSync(dir)) {
      console.log(`Removing ${dir}...`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (error) {
    console.log(`Could not remove ${dir}:`, error.message);
  }
});

console.log('✅ Cache cleared successfully!');
console.log('🚀 Now run "npx expo start --clear" to start fresh.'); 