/**
 * polyfill for getComputedStyle
 */

// from https://github.com/Financial-Times/polyfill-service/blob/master/polyfills/getComputedStyle/polyfill.js
(function (global) {
  if ('getComputedStyle' in global && typeof global.getComputedStyle === 'function') {
    return
  }
  function getPixelSize (element, style, property, fontSize) {
    var sizeWithSuffix = style[property]
    var size = parseFloat(sizeWithSuffix)
    var suffix = sizeWithSuffix.split(/\d/)[0]
    var rootSize
    fontSize = (fontSize !== null) ? fontSize :
      (/%|em/.test(suffix) && element.parentElement) ?
        getPixelSize(element.parentElement, element.parentElement.currentStyle, 'fontSize', null) : 16
    rootSize = property === 'fontSize' ? fontSize :
      /width/i.test(property) ? element.clientWidth : element.clientHeight
    return (suffix ==='em') ? size * fontSize :
      (suffix === 'in') ? size * 96 :
        (suffix === 'pt') ? size * 96 / 72 :
          (suffix === '%') ? size / 100 * rootSize : size
  }

  function setShortStyleProperty (style, property) {
    var borderSuffix = property === 'border' ? 'Width' : ''
    var t = property + 'Top' + borderSuffix
    var r = property + 'Right' + borderSuffix
    var b = property + 'Bottom' + borderSuffix
    var l = property + 'Left' + borderSuffix
    style[property] = (style[t] == style[r] == style[b] == style[l] ? [style[t]]
      : style[t] == style[b] && style[l] == style[r] ? [style[t], style[r]]
      : style[l] == style[r] ? [style[t], style[r], style[b]]
      : [style[t], style[r], style[b], style[l]]).join(' ')
  }

  function CSSStyleDeclaration (element) {
    var currentStyle = element.currentStyle || {}
    var style = this
    var fontSize = getPixelSize(element, currentStyle, 'fontSize', null)
    for (var property in currentStyle) {
      if (/width|height|margin.|padding.|border.+W/.test(property) && style[property] !== 'auto') {
        style[property] = getPixelSize(element, currentStyle, property, fontSize) + 'px'
      } else if (property === 'styleFloat') {
        style['float'] = currentStyle[property]
      } else {
        style[property] = currentStyle[property]
      }
    }
    setShortStyleProperty(style, 'margin')
    setShortStyleProperty(style, 'padding')
    setShortStyleProperty(style, 'border')
    style.fontSize = fontSize + 'px'
    return style
  }

  CSSStyleDeclaration.prototype = {
    constructor: CSSStyleDeclaration,
    getPropertyPriority: function () { },
    getPropertyValue: function (prop) {
      return this[prop] || ''
    },
    item: function () { },
    removeProperty: function () { },
    setProperty: function () { },
    getPropertyCSSValue: function () { }
  }
  global.getComputedStyle = function (node) {
    return new CSSStyleDeclaration(node)
  }
})(window)