// metro.config.js
const { getDefaultConfig } = require('expo/metro-config'); // se estiver usando Expo
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push('wasm');
defaultConfig.resolver.sourceExts.push('wasm');

defaultConfig.transformer = {
  ...defaultConfig.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

defaultConfig.resolver = {
  ...defaultConfig.resolver,
  assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
};

module.exports = defaultConfig;
