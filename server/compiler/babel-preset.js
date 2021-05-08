const env = process.env.NODE_ENV || 'production'
const isDevelopment = env === 'development'
const isProduction = env === 'production'
const isTest = env === 'test'

module.exports = (api, options = {}) => {
  api.cache.invalidate(() => process.env.NODE_ENV)
  const isServer = api.caller((caller) => !!caller && caller.isServer)

  return {
    sourceType: 'unambiguous',
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: 'auto',
          bugfixes: true,
          ...(isServer || isTest
            ? { targets: { node: 'current' } }
            : {
                useBuiltIns: 'entry',
                corejs: 3,
                targets: 'last 2 Chrome versions',
              }),
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
      !isServer && [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          helpers: false,
          // https://github.com/babel/babel/issues/10261
          version: require('@babel/runtime/package.json').version,
          regenerator: false,
          ...options['transform-runtime'],
        },
      ],
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      isProduction && [
        require.resolve('babel-plugin-transform-react-remove-prop-types'),
        {
          removeImport: true,
        },
      ],
    ].filter(Boolean),
  }
}
