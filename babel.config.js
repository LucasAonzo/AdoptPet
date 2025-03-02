module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', '@babel/preset-react'],
    plugins: [
      '@babel/plugin-syntax-jsx',
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          alias: {
            '@': './src',
          },
        },
      ],
    ]
  };
}; 