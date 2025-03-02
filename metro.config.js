// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Handle static assets and animations properly
config.resolver.assetExts.push(
  // Animations
  'json',
  'lottie',
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  // Fonts
  'ttf',
  'otf',
  'woff',
  'woff2'
);

module.exports = config; 