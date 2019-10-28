const env = process.env.NODE_ENV
const isDevelopment = env === 'development'
const isProduction = env === 'production'
const isTest = env === 'test'

const useESModules = !isTest

module.exports = (api, options = {}) => {
  api.cache(true)

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: isTest ? 'commonjs' : false,
          useBuiltIns: 'usage',
          corejs: 3,
          exclude: ['transform-typeof-symbol'],
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
      [
        '@babel/plugin-transform-runtime',
        {
          useESModules,
          helpers: false,
          // https://github.com/babel/babel/issues/10261
          // eslint-disable-next-line import/no-extraneous-dependencies
          version: require('@babel/runtime/package.json').version,
          regenerator: false,
          ...options['transform-runtime'],
        },
      ],
      '@babel/plugin-syntax-dynamic-import',
      'babel-plugin-macros',
      isProduction && [
        'babel-plugin-transform-react-remove-prop-types',
        {
          removeImport: true,
        },
      ],
    ].filter(Boolean),
  }
}
