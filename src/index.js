import postcss from 'postcss'
import PxConverter from './PxConverter'

const plugin = postcss.plugin('postcss-pxconverter', options => {
  return (css, result) => {
    const converter = new PxConverter(options)
    const targetCssText = converter.convert(css.toString())
    result.root = postcss.parse(targetCssText)
  }
})

export default plugin
