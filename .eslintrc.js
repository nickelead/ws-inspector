module.exports = {
  env: {
    browser: true,
    es6: true,
    webextensions: true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    "react",
    "import",
  ],
  rules: {
  },
};

/**
 * https://github.com/airbnb/javascript User Manual for 'airbnb'
 * https://github.com/leonidlebedev/javascript-airbnb/
 * https://github.com/airbnb/javascript/tree/master/react
 * https://github.com/yannickcr/eslint-plugin-react
 * https://github.com/leonidlebedev/javascript-airbnb/tree/master/react
 */