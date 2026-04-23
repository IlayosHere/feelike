module.exports = function (api) {
  const isTest = api.env('test');
  api.cache.invalidate(() => isTest);
  return {
    presets: [
      'babel-preset-expo',
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: { '@': './src' },
        },
      ],
      // reanimated/plugin requires react-native-worklets in Reanimated 4 — skip in
      // Jest since jest-expo fully mocks Reanimated via its preset.
      ...(!isTest ? ['react-native-reanimated/plugin'] : []),
    ],
  };
};
