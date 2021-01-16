const env = process.env.NODE_ENV || 'production'
const isDevelopment = env === 'development'
const isProduction = env === 'production'
const isTest = env === 'test'
const modules = process.env.BABEL_MODULES || false
const useESModules = !modules && (isDevelopment || isProduction)

module.exports = (api, options = {}) => {
  api.cache.using(() => process.env.NODE_ENV)

  return {
    presets: [
      isTest && [
        require.resolve('@babel/preset-env'),
        {
          targets: {
            node: 'current',
          },
        },
      ],
      (isDevelopment || isProduction) && [
        require.resolve('@babel/preset-env'),
        {
          modules,
          bugfixes: true,
          useBuiltIns: 'usage',
          corejs: 3,
          // Exclude transforms that make all code slower
          exclude: ['transform-typeof-symbol'],
          ...options['preset-env'],
        },
      ],
      [
        require.resolve('@babel/preset-react'),
        {
          useBuiltIns: true,
          development: isDevelopment || isTest,
          runtime: 'automatic',
          ...options['preset-react'],
        },
      ],
    ].filter(Boolean),
    plugins: [
      [
        require.resolve('@babel/plugin-proposal-class-properties'),
        { loose: true, ...options['class-properties'] },
      ],
      [
        require.resolve('@babel/plugin-proposal-object-rest-spread'),
        { loose: true, useBuiltIns: true },
      ],
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
      [
        require.resolve('@babel/plugin-transform-runtime'),
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
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('babel-plugin-macros'),
      isProduction && [
        require.resolve('babel-plugin-transform-react-remove-prop-types'),
        {
          removeImport: true,
        },
      ],
    ].filter(Boolean),
  }
}
