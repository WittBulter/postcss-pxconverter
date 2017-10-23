import eslint from 'rollup-plugin-eslint'
import buble from 'rollup-plugin-buble'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/postcss-pxconverter.js',
    format: 'cjs',
  },
  plugins: [ eslint(), buble() ],
  external: [ 'postcss', 'css', 'object-assign' ],
}
