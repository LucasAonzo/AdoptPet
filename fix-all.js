/**
 * Comprehensive script to fix common React Native/Expo issues
 * Run with: node fix-all.js
 */
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

console.log('🛠️ Starting comprehensive fix script for AdoptMe app...');

// Step 1: Clean npm cache
console.log('\n🧹 Cleaning npm cache...');
try {
  childProcess.execSync('npm cache clean --force', {
    stdio: 'inherit',
  });
  console.log('✅ npm cache cleaned');
} catch (error) {
  console.log('⚠️ Error cleaning npm cache:', error.message);
}

// Step 2: Delete node_modules and package-lock.json
console.log('\n🗑️ Removing node_modules and package-lock.json...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
const packageLockPath = path.join(__dirname, 'package-lock.json');

if (fs.existsSync(nodeModulesPath)) {
  try {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log('✅ node_modules removed');
  } catch (error) {
    console.log('⚠️ Error removing node_modules:', error.message);
  }
}

if (fs.existsSync(packageLockPath)) {
  try {
    fs.unlinkSync(packageLockPath);
    console.log('✅ package-lock.json removed');
  } catch (error) {
    console.log('⚠️ Error removing package-lock.json:', error.message);
  }
}

// Step 3: Clear Metro bundler cache
console.log('\n🧹 Clearing Metro bundler cache...');
try {
  const tempDirs = [
    path.join(require('os').tmpdir(), 'metro-bundler-cache'),
    path.join(require('os').tmpdir(), 'react-native-packager-cache'),
    path.join(require('os').tmpdir(), 'haste-map-react-native-packager'),
  ];

  tempDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`Removing ${dir}...`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
  
  console.log('✅ Metro bundler cache cleared');
} catch (error) {
  console.log('⚠️ Error clearing Metro bundler cache:', error.message);
}

// Step 4: Clear Watchman cache (if available)
console.log('\n🧹 Clearing Watchman cache (if available)...');
try {
  childProcess.execSync('watchman watch-del-all', {
    stdio: 'inherit',
  });
  console.log('✅ Watchman cache cleared');
} catch (error) {
  console.log('ℹ️ Watchman might not be installed or not in use. Skipping.');
}

// Step 5: Reinstall dependencies
console.log('\n📦 Reinstalling dependencies...');
try {
  childProcess.execSync('npm install', {
    stdio: 'inherit',
  });
  console.log('✅ Dependencies reinstalled');
} catch (error) {
  console.log('⚠️ Error reinstalling dependencies:', error.message);
}

// Step 6: Install specific required packages to ensure they're available
console.log('\n📦 Ensuring critical packages are installed...');
try {
  childProcess.execSync('npm install react-native-animatable date-fns lottie-react-native@7.1.0', {
    stdio: 'inherit',
  });
  console.log('✅ Critical packages installed/verified');
} catch (error) {
  console.log('⚠️ Error installing critical packages:', error.message);
}

// Step 7: Verify assets directory structure
console.log('\n📁 Verifying assets directory structure...');
const assetsPaths = [
  path.join(__dirname, 'assets', 'animations'),
  path.join(__dirname, 'src', 'assets', 'animations'),
];

assetsPaths.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } catch (error) {
      console.log(`⚠️ Error creating directory ${dir}:`, error.message);
    }
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

// Step 8: Final instructions
console.log('\n✨ All fixes applied! To start the app with a clean cache, run:');
console.log('npx expo start --clear');
console.log('\n🔍 If you continue to encounter issues, please:\n');
console.log('1. Verify all import paths are correct');
console.log('2. Check for compatibility between Expo SDK and installed packages');
console.log('3. Verify that the animation files are in the correct location (both src/assets/animations and assets/animations)');
console.log('4. Verify that you\'re using the correct version of lottie-react-native (7.1.0)');
console.log('\nGood luck! 🚀'); 