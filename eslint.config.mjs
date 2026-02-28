import neostandard from 'neostandard';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Global ignores
  {
    ignores: ['src/components/__tests__/**']
  },

  // neostandard base config, no style rules, browser globals
  ...neostandard({ noStyle: true, env: ['browser'] }),

  // React recommended rules
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],

  // React hooks recommended rules
  reactHooks.configs.flat.recommended,

  // Project config
  {
    files: ['src/**/*.js'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        AFRAME: 'readonly',
        THREE: 'readonly'
      }
    },
    plugins: {
      react: reactPlugin
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      'no-useless-return': 'off',
      'no-var': 'off',
      'object-shorthand': 'off',
      'prefer-const': 'off'
    }
  }
];
