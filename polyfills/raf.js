/**
 * polyfill for requestAnimationFrame
 */

// from https://github.com/chrisdickinson/raf/
(function (global) {
  if (!('requestAnimationFrame' in global)) {
    return
  }
  var now = (function () {
    var loadTime
    if ('performance' in global && typeof global.performance.now === 'function') {
      return function () {
        return global.performance.now()
      }
    }
    if (typeof Date.now === 'function') {
      loadTime = Date.now()
      return function () {
        return Date.now() - loadTime
      }
    }
    loadTime = new Date().getTime()
    return function () {
      return new Date().getTime() - loadTime
    }
  })()

  var TARGET_FPS = 60
  var frameDuration = 1000 / TARGET_FPS
  var queue = []
  var id = 0
  var last = 0
  global.requestAnimationFrame = function (callback) {
    if (queue.length === 0) {
      var nowTime = now()
      var next = Math.max(0, frameDuration - (nowTime - last))
      last = next + nowTime
      setTimeout(function () {
        var cp = queue.slice(0)
        queue = []
        for (var i = 0; i < cp.length; i++) {
          if (!cp[i].cancelled) {
            try {
              cp[i].callback(last)
            } catch (e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  global.cancelAnimationFrame = function (handle) {
    for (var i = 0; i < queue.length; i++) {
      if (queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
})(window)