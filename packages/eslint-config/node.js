import globals from 'globals';
import base from './index.js';

/** Flat config for Node services (apps/api). */
export default [
  ...base,
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
];
