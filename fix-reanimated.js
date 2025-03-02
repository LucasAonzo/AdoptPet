const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛠️ Starting Reanimated fix script...');

// Fix babel.config.js
const babelConfigPath = path.join(__dirname, 'babel.config.js');
try {
  console.log('📝 Updating babel.config.js to include Reanimated plugin...');
  let babelConfig = fs.readFileSync(babelConfigPath, 'utf8');
  
  // Check if Reanimated plugin is already included
  if (!babelConfig.includes('react-native-reanimated/plugin')) {
    // Replace the plugins array with one that includes Reanimated
    babelConfig = babelConfig.replace(
      /plugins\s*:\s*\[(.*?)\]/s,
      'plugins: [$1, \'react-native-reanimated/plugin\']'
    );
    
    fs.writeFileSync(babelConfigPath, babelConfig);
    console.log('✅ Updated babel.config.js successfully');
  } else {
    console.log('✅ Reanimated plugin already in babel.config.js');
  }
} catch (error) {
  console.error('❌ Error updating babel.config.js:', error.message);
}

// Check package.json and update Reanimated version if needed
const packageJsonPath = path.join(__dirname, 'package.json');
try {
  console.log('📝 Checking Reanimated version in package.json...');
  const packageJson = require(packageJsonPath);
  
  const currentVersion = packageJson.dependencies['react-native-reanimated'];
  console.log(`Current Reanimated version: ${currentVersion}`);
  
  if (currentVersion !== '~3.16.1') {
    console.log('📦 Installing correct Reanimated version (3.16.1)...');
    try {
      execSync('npm uninstall react-native-reanimated', { stdio: 'inherit' });
      execSync('npm install react-native-reanimated@3.16.1', { stdio: 'inherit' });
      console.log('✅ Reanimated updated successfully');
    } catch (error) {
      console.error('❌ Error updating Reanimated version:', error.message);
    }
  } else {
    console.log('✅ Reanimated version is already correct');
  }
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

// Verify imports in App.js
const appJsPath = path.join(__dirname, 'App.js');
try {
  console.log('📝 Verifying imports in App.js...');
  let appJs = fs.readFileSync(appJsPath, 'utf8');
  
  // Check if gesture handler import is at the top
  if (!appJs.startsWith("import 'react-native-gesture-handler';")) {
    console.log('📝 Updating App.js to include gesture handler import at the top...');
    appJs = "import 'react-native-gesture-handler';\n" + appJs;
    fs.writeFileSync(appJsPath, appJs);
    console.log('✅ Updated App.js successfully');
  } else {
    console.log('✅ App.js already has gesture handler import at the top');
  }
  
  // Check if React is imported
  if (!appJs.includes("import React from 'react';")) {
    console.log('📝 Adding React import to App.js...');
    const lines = appJs.split('\n');
    // Find the right place to add the import
    let importIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        importIndex = i + 1;
      } else if (lines[i].trim() !== '' && !lines[i].startsWith('import ')) {
        break;
      }
    }
    lines.splice(importIndex, 0, "import React from 'react';");
    appJs = lines.join('\n');
    fs.writeFileSync(appJsPath, appJs);
    console.log('✅ Added React import to App.js');
  } else {
    console.log('✅ App.js already imports React');
  }
} catch (error) {
  console.error('❌ Error updating App.js:', error.message);
}

console.log('\n✨ Reanimated fix script completed!');
console.log('🚀 Run your app with: npx expo start --clear'); 