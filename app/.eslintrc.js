module.exports = {
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
        message:
          'Raw hex colors are banned in components/screens. Use semantic NativeWind class names (bg-bg, text-accent, etc.). Only app/src/theme/tokens.ts may contain hex values.',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
  },
  overrides: [
    {
      files: ['src/theme/tokens.ts'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
