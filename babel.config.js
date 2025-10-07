/* eslint-env node */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@theme': './src/theme',
            '@utils': './src/utils',
            '@services': './src/services'
          }
        }
      ]
    ]
  };
};
