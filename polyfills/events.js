/**
 * polyfill for DOM Event
 */

(function (global, undefined) {
  if (!('Element' in global)
    || ('addEventListener' in global
    && 'addEventListener' in global.document
    && 'removeEventListener' in global
    && 'removeEventListener' in global.document)
    || !Object.defineProperty) {
    return
  }
  Event.CAPTURING_PHASE = 1
  Event.AT_TARGET = 2
  Event.BUBBLING_PHASE = 3

  Object.defineProperties(Event.prototype, {
    CAPTURING_PHASE: { get: function() { return 1; } },
    AT_TARGET: { get: function() { return 2; } },
    BUBBLING_PHASE: { get: function() { return 3; } },
    target: {
      get: function () {
        return this.srcElement
      }
    },
    currentTarget: {
      get: function () {
        return this._currentTarget
      }
    },
    eventPhase: {
      get: function () {
        return (this.srcElement === this.currentTarget) ? Event.AT_TARGET : Event.BUBBLING_PHASE
      }
    },
    bubbles: {
      get: function () {
        switch (this.type) {
          // Mouse
          case 'click':
          case 'dblclick':
          case 'mousedown':
          case 'mouseup':
          case 'mouseover':
          case 'mousemove':
          case 'mouseout':
          case 'mousewheel':
            // Keyboard
          case 'keydown':
          case 'keypress':
          case 'keyup':
            // Frame/Object
          case 'resize':
          case 'scroll':
            // Form
          case 'select':
          case 'change':
          case 'submit':
          case 'reset':
            return true
        }
        return false
      }
    },
    cancelable: {
      get: function () {
        switch (this.type) {
            // Mouse
          case 'click':
          case 'dblclick':
          case 'mousedown':
          case 'mouseup':
          case 'mouseover':
          case 'mouseout':
          case 'mousewheel':
            // Keyboard
          case 'keydown':
          case 'keypress':
          case 'keyup':
            // Form
          case 'submit':
            return true
        }
        return false
      }
    },
    timeStamp: {
      get: function () {
        return this._timeStamp
      }
    },
    stopPropagation: {
      value: function () {
        this.cancelBubble = true
      }
    },
    preventDefault: {
      value: function () {
        this.returnValue = false
      }
    },
    defaultPrevented: {
      get: function () {
        return this.returnValue === false
      }
    }
  })

  var handlersFlag = 'X-EVENTS-HANDLERS-CACHE'

  function getEventHandler (element, handler) {
    var handlers = handler[handlersFlag]
    if (handlers && handlers.length) {
      for (var i = 0; i < handlers.length; i++) {
        var handlerItem = handlers[i]
        if (handlerItem.node && handlerItem.node === element) {
          return handlerItem.handlerWrapper
        }
      }
    }
  }

  function setEventHandler (element, handler, handlerWrapper) {
    var handlers = handler[handlersFlag] || (handler[handlersFlag] = [])
    var handlerInCache = getEventHandler(element, handler)
    if (!handlerInCache) {
      handlers.unshift({
        node: element,
        handlerWrapper: handlerWrapper
      })
      return handlerWrapper
    }
    return handlerInCache
  }

  function addEventListener (type, listener, useCapture) {
    if (typeof listener !== 'function') {
      return
    }
    if (type === 'DOMContentLoaded') {
      type = 'load'
    }
    var target = this
    this.attachEvent('on' + type, setEventHandler(target, listener, function (e) {
      e._timeStamp = Date.now()
      e._currentTarget = target
      listener.call(target, e)
      e._currentTarget = null
    }))
  }

  function removeEventListener (type, listener, useCapture) {
    if (typeof listener !== 'function') {
      return
    }
    if (type === 'DOMContentLoaded') {
      type = 'load'
    }
    var handlerInCache = getEventHandler(this, listener)
    if (handlerInCache) {
      this.detachEvent('on' + type, handlerInCache)
    }
  }
  [Window, HTMLDocument, Element].forEach(function (o) {
    o.prototype.addEventListener = addEventListener
    o.prototype.removeEventListener = removeEventListener
  })
})(window, void 0)