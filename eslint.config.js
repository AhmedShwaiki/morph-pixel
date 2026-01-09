import js from '@eslint/js';
import nodePlugin from 'eslint-plugin-node';
import jestPlugin from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
    // Base recommended rules
    js.configs.recommended,

    // Global ignores
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            'output/**',
            'uploads/**',
            '*.config.js',
            'babel.config.json',
        ],
    },

    // All JavaScript files
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
            },
        },
        plugins: {
            node: nodePlugin,
            prettier: prettier,
        },
        rules: {
            ...prettierConfig.rules,
            'prettier/prettier': 'error',
            
            // Node.js best practices
            'node/no-unpublished-import': 'off', // Allow dev dependencies in test files
            'node/no-missing-import': 'off', // ES modules resolve differently
            'node/no-extraneous-import': 'off',
            'node/no-unsupported-features/es-syntax': 'off', // Allow ES modules
            
            'no-console': 'warn',
            'no-unused-vars': ['error', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
            'no-undef': 'error',
            'no-unreachable': 'error',
            'no-duplicate-imports': 'error',
            'no-useless-return': 'error',
            'prefer-const': 'error',
            'prefer-arrow-callback': 'error',
            'prefer-template': 'error',
            
            // Code quality
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
            'brace-style': ['error', '1tbs', { allowSingleLine: false }],
            'comma-dangle': ['error', 'always-multiline'],
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            
            // Async/await
            'no-async-promise-executor': 'error',
            'no-await-in-loop': 'warn',
            'prefer-promise-reject-errors': 'error',
            
            // Security
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
        },
    },

    // Test files
    {
        files: ['**/*.test.js', '**/tests/**/*.js'],
        plugins: {
            jest: jestPlugin,
        },
        languageOptions: {
            globals: {
                ...jestPlugin.environments.globals.globals,
            },
        },
        rules: {
            ...jestPlugin.configs.recommended.rules,
            'jest/expect-expect': 'warn',
            'jest/no-disabled-tests': 'warn',
            'jest/no-focused-tests': 'error',
            'jest/prefer-to-have-length': 'warn',
            'jest/valid-expect': 'error',
        },
    },
];

