module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@': './src',
          '@screens': './src/screens/index',
          '@components': './src/components/index',
          '@constants': './src/constants',
          '@hooks': './src/hooks',
          '@type': './src/types',
          '@api': './src/api',
          '@images': './src/assets/images',
          '@css': './src/assets/css',
          '@utils': './src/utils',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
