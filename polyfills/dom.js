/**
 * polyfill for DOM
 */

(function (global) {
  if (!('document' in global)) {
    return
  }
  var document = global.document

  // IE8- document.getElementsByClassName
  if (!document.getElementsByClassName && document.querySelectorAll) {
    var getElementsByClassName = function (classNames) {
      classNames = String(classNames).replace(/^|\s+/g, '.')
      return this.querySelectorAll(classNames)
    }
    void [HTMLDocument, Element].forEach(function (o) {
      o.prototype.getElementsByClassName = getElementsByClassName
    })
  }

  // IE CustomEvent
  if (!('CustomEvent' in global) || typeof global.CustomEvent !== 'function') {
    var CustomEvent = function (event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined }
      var evt = document.createEvent('CustomEvent')
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
      return evt
    }
    CustomEvent.prototype = global.Event.prototype
    global.CustomEvent = CustomEvent
  }

  // Element.matches
  // from https://developer.mozilla.org/en/docs/Web/API/Element/matches
  (function () {
    if (!('Element' in global) || Element.prototype.matches) {
      return
    }
    var matchesVenders = ['ms', 'o', 'moz', 'webkit']
    var matchesSelectorSuffix = 'MatchesSelector'
    for (var i = 0; i < matchesVenders.length; i++) {
      var matchesSelector = matchesVenders[i] + matchesSelectorSuffix
      if (matchesSelector in Element.prototype) {
        Element.prototype.matches = Element.prototype[matchesSelector]
        return
      }
    }
    if (document.querySelectorAll) {
      Element.prototype.matches = function matches (selector) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(selector)
        var i = matches.length
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1
      };
    }
  })()
})(window)