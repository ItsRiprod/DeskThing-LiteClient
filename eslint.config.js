import js from '@eslint/js'
import { browser } from 'globals'
import react from 'eslint-plugin-react'
import prettier from 'eslint-plugin-prettier'

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  react.configs.recommended,
  react.configs['jsx-runtime'],
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: browser,
    },
    plugins: {
      'react': react,
      'prettier': prettier
    },
    rules: {
      'prettier/prettier': ['error', {
        endOfLine: 'auto'
      }],
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
]