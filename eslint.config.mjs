import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import sonarPlugin from 'eslint-plugin-sonarjs';
import unicornplugin from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist',
      'frontend/dist',
      'node_modules',
      'public',
      'tmp',
      'frontend/node_modules'
    ]
  },
  js.configs.all,
  importPlugin.flatConfigs.recommended,
  promisePlugin.configs['flat/recommended'],
  sonarPlugin.configs.recommended,
  unicornplugin.configs['flat/recommended'],
  prettierConfig,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      },
      ecmaVersion: 15,
      sourceType: 'module'
    },
    rules: {
      'func-style': [
        'error',
        'declaration',
        {
          allowArrowFunctions: true
        }
      ],
      'id-length': [
        'error',
        {
          exceptions: ['i', 'n']
        }
      ],
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc'
          },

          groups: [
            ['builtin', 'external'],
            ['internal', 'sibling', 'parent']
          ],
          'newlines-between': 'always'
        }
      ],
      'init-declarations': 'off',
      'max-params': ['error', 5],
      'max-statements': ['error', 25],
      'new-cap': ['error', { capIsNewExceptions: ['Router'] }],
      'no-magic-numbers': 'off',
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-ternary': 'off',
      'no-undefined': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: false,
          variables: true,
          allowNamedExports: false
        }
      ],
      'one-var': ['error', 'never'],
      'promise/no-callback-in-promise': 'off',
      'sonarjs/new-cap': 'off',
      'sort-keys': 'off',
      'sort-imports': 'off',
      'unicorn/catch-error-name': [
        'error',
        {
          name: 'err'
        }
      ],
      'unicorn/explicit-length-check': [
        'error',
        {
          'non-zero': 'not-equal'
        }
      ],
      'unicorn/import-style': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            db: true,
            err: true,
            func: true,
            req: true,
            res: true
          }
        }
      ]
    }
  }
];
