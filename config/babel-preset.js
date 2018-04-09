module.exports = () => ({
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    ['@babel/preset-react', { useBuiltIns: true }],
    '@babel/preset-flow',
  ],
  plugins: [
    'babel-plugin-macros',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: false,
        polyfill: false,
        regenerator: true,
      },
    ],
    '@babel/plugin-syntax-dynamic-import',
    'react-hot-loader/babel',
    'styled-components',
  ],
})
