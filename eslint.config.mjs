import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(js.configs.recommended, tseslint.configs.recommended, {
  rules: {
    eqeqeq: 'error',
    'no-useless-rename': 'error',
  },
});
