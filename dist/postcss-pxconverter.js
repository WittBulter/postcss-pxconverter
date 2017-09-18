'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var postcss = _interopDefault(require('postcss'));
var css = _interopDefault(require('css'));
var objectAssign = _interopDefault(require('object-assign'));

var pxRegExp = /\b(\d+(\.\d+)?)px\b/;
var defaultConfig = {
  baseSize: {
    rem: 75,
    vw: 7.5,
  },
  precision: 6,
  keepRuleComment: 'no',
  keepFileComment: 'pxconverter-disable',
};

var PxConverter = function PxConverter () {};

PxConverter.prototype.contructor = function contructor (options) {
  this.config = objectAssign({}, defaultConfig, options);
};

PxConverter.prototype.convert = function convert (cssText) {
  var astObj = css.parse(cssText);
  var firstRule = astObj.stylesheet.rules[0];
  if (!firstRule) { return cssText }
  // 忽略整个文件
  var isDisabled = firstRule.type === 'comment'
    && firstRule.comment.trim() === this.config.keepFileComment;
  if (isDisabled) { return cssText }

  this.processRules(astObj.stylesheet.rules);
  return css.stringify(astObj)
};

PxConverter.prototype.processRules = function processRules (rules) {
    var this$1 = this;

  rules.forEach(function (rule) {
    if (rule.type === 'media') { return this$1.processRules(rule.rules) }
    if (rule.type === 'keyframes') { return this$1.processRules(rule.keyframes) }
    if (rule.type !== 'rule' && rule.type !== 'keyframe') { return }

    rule.declarations.forEach(function (dec, index) {
      // 必须为可转换的规则
      if (dec.type !== 'declaration' || !pxRegExp.test(dec.value)) { return }
      // 如果包含禁用注释，则忽略
      var nextDec = rule.declarations[index + 1];
      var isDisabled = nextDec
        && nextDec.type === 'comment'
        && nextDec.comment.trim() === this$1.config.keepRuleComment;
      if (isDisabled) { return }

      dec.value = this$1.getCalcValue('rem', dec.value);
      // 对于非字号的规则，需要增加一条 vw 的属性
      if (dec.property !== 'font' && dec.property !== 'font-size') {
        rule.declarations.splice(index + 1, 0, {
          type: 'declaration',
          property: dec.property,
          value: this$1.getCalcValue('vw', dec.value),
        });
      }
    });
  });
};

PxConverter.prototype.getCalcValue = function getCalcValue (targetUnit, sourceValue) {
  var baseSize = this.config.baseSize[targetUnit];
  if (!baseSize) { return sourceValue }

  var value = sourceValue.match(pxRegExp)[1] / baseSize;
  return value
    ? ("" + (value.toFixed(this.config.precision)) + targetUnit)
    : 0
};

var plugin = postcss.plugin('postcss-pxconverter', function (options) {
  return function (css$$1, result) {
    var converter = new PxConverter(options);
    var targetCssText = converter.convert(css$$1.toString());
    result.root = postcss.parse(targetCssText);
  }
});

module.exports = plugin;
