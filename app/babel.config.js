module.exports = function (api) {
  // api.env() invalidates the cache per environment, so use invalidate() not true.
  const isTest = api.env('test');
  api.cache.invalidate(() => isTest);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // nativewind/babel is a Metro-only transform; skip it in Jest to avoid
      // @babel/core plugin validation errors in the jest-expo test environment.
      ...(!isTest ? ['nativewind/babel'] : []),
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
