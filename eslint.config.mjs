import js from '@eslint/js';
import next from 'eslint-config-next';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      '.turbo/**',
      '.netlify/**',
    ],
  },
  js.configs.recommended,
  ...next,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true, ignoreVoidOperator: true },
      ],
      '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { arguments: false } }],
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignoreMixedLogicalExpressions: true,
        },
      ],
      // Temporarily disable due to upstream crash in 8.46.2 with certain type parameter constructs.
      '@typescript-eslint/unified-signatures': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },
);
