module.exports = {
  root: true,
  extends: [
    'universe/native',
    'universe/shared/typescript-analysis'
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  ],
  rules: {
    // Custom project-specific rules
    'no-console': 'warn',
    'react/jsx-no-bind': 'off', // Allows inline arrow functions
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off', // We're using TypeScript for type checking
    'react-hooks/exhaustive-deps': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};