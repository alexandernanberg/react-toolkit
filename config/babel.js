module.exports = {
  presets: [
    [
      'env',
      {
        modules: false,
        useBuiltIns: true,
      },
    ],
    'react',
  ],
  plugins: [
    'preval',
    'transform-class-properties',
    'transform-object-rest-spread',
    'syntax-dynamic-import',
    'react-hot-loader/babel',
    'styled-components',
  ],
}
