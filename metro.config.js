/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for Expo + React Native
 * - Adds support for bundling .txt files as assets so we can require them
 */
const config = getDefaultConfig(__dirname);

// Ensure .txt is treated as an asset extension
config.resolver.assetExts = Array.from(new Set([...(config.resolver.assetExts || []), 'txt']));

module.exports = config;
