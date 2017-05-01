/**
 * Polyfill for Viewport
 */

(function (global) {
  if ('innerWidth' in global && 'innerHeight' in global && 'pageXOffset' in global && 'pageYOffset' in global) {
    return;
  }
  var doc = global.document
  var docEl = doc.documentElement
  var body = doc.body || doc.createElement('body')

  function scrollX () {
    return (docEl.scrollLeft || body.scrollLeft || 0) - (docEl.clientLeft || body.clientLeft || 0)
  }

  function scrollY () {
    return (docEl.scrollTop || body.scrollTop || 0) - (docEl.clientTop || body.clientTop || 0)
  }

  Object.defineProperties(global, {
    innerWidth: {
      get: function () {
        return docEl.clientWidth
      }
    },
    innerHeight: {
      get: function () {
        return docEl.clientHeight
      }
    },
    pageXOffset: {
      get: scrollX
    },
    pageYOffset: {
      get: scrollY
    },
    scrollX: {
      get: scrollX
    },
    scrollY: {
      get: scrollY
    }
  })
})(window)