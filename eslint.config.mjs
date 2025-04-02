import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
   eslint.configs.recommended,
   ...tseslint.configs.strict,
   { ignores: ['**/*.js'] },
   {
      rules: {
         '@typescript-eslint/no-non-null-assertion': 'off',
         'no-unused-vars': 'off',
         '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_' },
         ],
      },
   },
   {
      files: ["tests/**/*"],
      env: {
         jest: true
      }
   },
];
