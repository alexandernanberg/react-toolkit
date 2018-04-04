module.exports = () => ({
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-flow',
  ],
  plugins: [
    'preval',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    'react-hot-loader/babel',
    'styled-components',
  ],
})
