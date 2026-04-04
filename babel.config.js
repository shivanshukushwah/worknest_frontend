module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@screens': './src/screens',
            '@components': './src/components',
            '@navigation': './src/navigation',
            '@context': './src/context',
            '@hooks': './src/hooks',
            '@api': './src/api',
            '@utils': './src/utils',
            '@mytypes': './src/types',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
