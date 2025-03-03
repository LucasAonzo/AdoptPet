/**
 * Debug Log Extractor Utility
 * 
 * This script helps to extract and examine debug logs from the app's file system
 * without needing to run the app. It can be useful when the app is crashing
 * and you can't access the logs through the UI.
 * 
 * Usage:
 * 1. Connect your device or ensure the emulator is running
 * 2. Run: node scripts/debug-log-extractor.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const APP_PACKAGE_NAME = 'com.yourcompany.adoptme'; // Update with your actual package name
const LOG_FILES = [
  'logs/error_logs.json',
  'logs/breadcrumbs.json',
  'logs/debug_init.txt'
];
const OUTPUT_DIR = path.join(__dirname, '../debug-logs');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get timestamp for this extraction
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const extractionDir = path.join(OUTPUT_DIR, `extraction-${timestamp}`);
fs.mkdirSync(extractionDir, { recursive: true });

console.log(`\n📱 AdoptMe Debug Log Extractor`);
console.log(`💾 Saving logs to: ${extractionDir}\n`);

function runAdbCommand(command) {
  try {
    return execSync(command).toString().trim();
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return '';
  }
}

function extractLogsFromDevice() {
  try {
    // Check for connected devices
    const devices = runAdbCommand('adb devices');
    if (!devices.includes('device')) {
      console.error('❌ No devices connected. Please connect a device or start an emulator.');
      return false;
    }
    
    console.log('✅ Device connected');
    
    // Get the path to the app's files directory
    const basePath = `/data/data/${APP_PACKAGE_NAME}/files`;
    
    // Pull each log file
    let foundAny = false;
    
    LOG_FILES.forEach(logFile => {
      const remotePath = `${basePath}/${logFile}`;
      const localPath = path.join(extractionDir, path.basename(logFile));
      
      try {
        console.log(`📥 Pulling ${logFile}...`);
        runAdbCommand(`adb shell "test -f ${remotePath} && echo exists"`);
        runAdbCommand(`adb pull ${remotePath} ${localPath}`);
        console.log(`   Saved to ${localPath}`);
        foundAny = true;
      } catch (error) {
        console.log(`   File not found: ${logFile}`);
      }
    });
    
    // Also dump the app's logcat
    const logcatPath = path.join(extractionDir, 'logcat.txt');
    console.log(`📋 Extracting app logcat...`);
    runAdbCommand(`adb logcat -d -v threadtime | grep ${APP_PACKAGE_NAME} > ${logcatPath}`);
    
    return foundAny;
  } catch (error) {
    console.error('Failed to extract logs:', error);
    return false;
  }
}

function displayLogSummary() {
  try {
    // Error logs
    const errorLogsPath = path.join(extractionDir, 'error_logs.json');
    if (fs.existsSync(errorLogsPath)) {
      const errorLogs = JSON.parse(fs.readFileSync(errorLogsPath, 'utf8'));
      console.log(`\n📊 Found ${errorLogs.length} error logs`);
      
      if (errorLogs.length > 0) {
        console.log('\n🔍 Latest errors:');
        errorLogs.slice(-3).forEach((log, i) => {
          console.log(`\n--- Error ${i + 1} ---`);
          console.log(`Type: ${log.type}`);
          console.log(`Time: ${log.timestamp}`);
          console.log(`Message: ${log.message}`);
          if (log.context) console.log(`Context: ${log.context}`);
        });
      }
    }
    
    // Breadcrumbs
    const breadcrumbsPath = path.join(extractionDir, 'breadcrumbs.json');
    if (fs.existsSync(breadcrumbsPath)) {
      const breadcrumbs = JSON.parse(fs.readFileSync(breadcrumbsPath, 'utf8'));
      console.log(`\n📊 Found ${breadcrumbs.length} breadcrumbs`);
      
      if (breadcrumbs.length > 0) {
        console.log('\n🔍 Latest breadcrumbs (most recent first):');
        breadcrumbs.slice(-10).reverse().forEach((crumb, i) => {
          console.log(`${i + 1}. [${crumb.timestamp.slice(11, 19)}] ${crumb.message}`);
        });
      }
    }
    
    console.log('\n✅ Log extraction complete!');
    console.log(`👉 See all logs in: ${extractionDir}`);
  } catch (error) {
    console.error('Error displaying log summary:', error);
  }
}

// Main execution
const success = extractLogsFromDevice();
if (success) {
  displayLogSummary();
} else {
  console.log('\n⚠️ No logs were found or extracted');
} 