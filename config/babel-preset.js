const env = process.env.NODE_ENV
const isDevelopment = env === 'development'
const isProduction = env === 'production'
const isTest = env === 'test'

const useESModules = !isTest

module.exports = (api, options = {}) => ({
  presets: [
    [
      '@babel/preset-env',
      {
        modules: isTest ? 'commonjs' : false,
        useBuiltIns: 'entry',
        corejs: 3,
        loose: true,
        exclude: [
          'transform-typeof-symbol',
          'transform-regenerator',
          'transform-async-to-generator',
        ],
        ...options['preset-env'],
      },
    ],
    [
      '@babel/preset-react',
      {
        useBuiltIns: true,
        development: isDevelopment || isTest,
        ...options['preset-react'],
      },
    ],
  ],
  plugins: [
    [
      '@babel/plugin-proposal-class-properties',
      { loose: true, ...options['class-properties'] },
    ],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    '@babel/plugin-syntax-dynamic-import',
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules,
        helpers: false,
        regenerator: false,
        ...options['transform-runtime'],
      },
    ],
    [
      'babel-plugin-transform-async-to-promises',
      {
        inlineHelpers: true,
        externalHelpers: true,
      },
    ],
    isProduction && [
      'babel-plugin-transform-react-remove-prop-types',
      {
        removeImport: true,
      },
    ],
    'babel-plugin-macros',
    'react-hot-loader/babel',
  ].filter(Boolean),
})
