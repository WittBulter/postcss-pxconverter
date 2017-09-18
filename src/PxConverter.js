import css from 'css'
import objectAssign from 'object-assign'

const pxRegExp = /\b(\d+(\.\d+)?)px\b/
const defaultConfig = {
  baseSize: {
    rem: 75,
    vw: 7.5,
  },
  precision: 6,
  keepRuleComment: 'no',
  keepFileComment: 'pxconverter-disable',
}

export default class PxConverter {
  contructor(options) {
    this.config = objectAssign({}, defaultConfig, options)
  }

  convert(cssText) {
    const astObj = css.parse(cssText)
    const firstRule = astObj.stylesheet.rules[0]
    if (!firstRule) return cssText
    // 忽略整个文件
    const isDisabled = firstRule.type === 'comment'
      && firstRule.comment.trim() === this.config.keepFileComment
    if (isDisabled) return cssText

    this.processRules(astObj.stylesheet.rules)
    return css.stringify(astObj)
  }

  processRules(rules) {
    rules.forEach(rule => {
      if (rule.type === 'media') return this.processRules(rule.rules)
      if (rule.type === 'keyframes') return this.processRules(rule.keyframes)
      if (rule.type !== 'rule' && rule.type !== 'keyframe') return

      rule.declarations.forEach((dec, index) => {
        // 必须为可转换的规则
        if (dec.type !== 'declaration' || !pxRegExp.test(dec.value)) return
        // 如果包含禁用注释，则忽略
        const nextDec = rule.declarations[index + 1]
        const isDisabled = nextDec
          && nextDec.type === 'comment'
          && nextDec.comment.trim() === this.config.keepRuleComment
        if (isDisabled) return

        dec.value = this.getCalcValue('rem', dec.value)
        // 对于非字号的规则，需要增加一条 vw 的属性
        if (dec.property !== 'font' && dec.property !== 'font-size') {
          rule.declarations.splice(index + 1, 0, {
            type: 'declaration',
            property: dec.property,
            value: this.getCalcValue('vw', dec.value),
          })
        }
      })
    })
  }

  getCalcValue(targetUnit, sourceValue) {
    const baseSize = this.config.baseSize[targetUnit]
    if (!baseSize) return sourceValue

    const value = sourceValue.match(pxRegExp)[1] / baseSize
    return value
      ? `${value.toFixed(this.config.precision)}${targetUnit}`
      : 0
  }
}
