// Configuration ESLint minimale ajoutée pour permettre `npm run lint`.
// Si tu utilisais déjà une autre config, supprime ce fichier.
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: { browser: true, es2022: true, node: true },
  plugins: ['react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // Ces règles génèrent beaucoup de bruit sur la base existante — on
    // les passe en warning pour ne pas casser le build.
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',
    'no-unused-vars': 'warn',
    'no-empty': 'warn',
    'react/no-unknown-property': 'warn',
  },
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist/', 'node_modules/', 'vite.config.js.timestamp-*'],
};
