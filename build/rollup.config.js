import buble from 'rollup-plugin-buble'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/postcss-pxconverter.js',
    format: 'cjs',
  },
  plugins: [ buble() ],
  external: [ 'postcss', 'css', 'object-assign' ],
}
