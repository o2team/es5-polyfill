/**
 * polyfill for DOM Event
 */

// from https://github.com/Financial-Times/polyfill-service/blob/master/polyfills/Event/polyfill.js
(function (global) {
  if (('Event' in global) && typeof global.Event === 'function') {
    return
  }
  var unlistenableWindowEvents = {
    click: 1,
    dblclick: 1,
    keyup: 1,
    keypress: 1,
    keydown: 1,
    mousedown: 1,
    mouseup: 1,
    mousemove: 1,
    mouseover: 1,
    mouseenter: 1,
    mouseleave: 1,
    mouseout: 1,
    storage: 1,
    storagecommit: 1,
    textinput: 1
  }
  var existingProto = (global.Event && global.Event.prototype) || null
  global.Event = Window.prototype.Event = function Event (type, eventInitDict) {
    if (!type) {
      throw new Error('Not enough arguments')
    }
    var event
    if ('createEvent' in document) {
      event = document.createEvent('Event')
      var bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false
      var cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false
      event.initEvent(type, bubbles, cancelable)
      return event
    }
    event = document.createEventObject()
    event.type = type
    event.bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false
    event.cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false
    return event
  }
  if (existingProto) {
    Object.defineProperty(global.Event, 'prototype', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: existingProto
    })
  }
  if (!('createEvent' in document)) {
    var addEventListener = function (type, listener) {
      var element = this
      if (element === global && type in unlistenableWindowEvents) {
        throw new Error('In IE8 the event: ' + type + ' is not available on the window object.')
      }
      if (!element._events) {
        element._events = {}
      }
      if (!element._events[type]) {
        element._events[type] = function (event) {
          var list = element._events[event.type].list
          var events = list.slice()
          var index = -1
          var length = events.length
          var eventElement
          event.preventDefault = function preventDefault () {
            if (event.cancelable !== false) {
              event.returnValue = false
            }
          }
          event.stopPropagation = function stopPropagation () {
            event.cancelBubble = true
          }
          event.stopImmediatePropagation = function stopImmediatePropagation () {
            event.cancelBubble = true
            event.cancelImmediate = true
          }
          event.currentTarget = element
          event.target = event.target || event.srcElement || element
          event.relatedTarget = event.fromElement ? (event.fromElement === event.target) ? event.toElement : event.fromElement : null
          event.timeStamp = new Date().getTime()
          if (event.clientX) {
            event.pageX = event.clientX + document.documentElement.scrollLeft
            event.pageY = event.clientY + document.documentElement.scrollTop
          }
          while (++index < length && !event.cancelImmediate) {
            if (index in events) {
              eventElement = events[index]
              if (list.indexOf(eventElement) !== -1 && typeof eventElement === 'function') {
                eventElement.call(element, event)
              }
            }
          }
        }
        element._events[type].list = []
        if (element.attachEvent) {
          element.attachEvent('on' + type, element._events[type])
        }
      }
      element._events[type].list.push(listener)
    }

    var removeEventListener = function (type, listener) {
      var element = this
      var index
      if (element._events && element._events[type] && element._events[type].list) {
        index = element._events[type].list.indexOf(listener)
        if (index !== -1) {
          element._events[type].list.splice(index, 1)
          if (!element._events[type].list.length) {
            if (element.detachEvent) {
              element.detachEvent('on' + type, element._events[type])
            }
            delete element._events[type]
          }
        }
      }
    }

    var dispatchEvent = function (event) {
      if (!arguments.length) {
        throw new Error('Not enough arguments')
      }
      if (!event || typeof event.type !== 'string') {
        throw new Error('DOM Events Exception 0')
      }
      var element = this, type = event.type
      try {
        if (!event.bubbles) {
          event.cancelBubble = true
          var cancelBubbleEvent = function (event) {
            event.cancelBubble = true
            ;(element || window).detachEvent('on' + type, cancelBubbleEvent)
          }
          this.attachEvent('on' + type, cancelBubbleEvent)
        }
        this.fireEvent('on' + type, event)
      } catch (error) {
        event.target = element
        do {
          event.currentTarget = element
          if ('_events' in element && typeof element._events[type] === 'function') {
            element._events[type].call(element, event)
          }
          if (typeof element['on' + type] === 'function') {
            element['on' + type].call(element, event)
          }
          element = element.nodeType === 9 ? element.parentWindow : element.parentNode
        } while (element && !event.cancelBubble)
      }
      return true
    }

    void [Window, HTMLDocument, Element].forEach(function (o) {
      o.prototype.addEventListener = addEventListener
      o.prototype.removeEventListener = removeEventListener
      o.prototype.dispatchEvent = dispatchEvent
    })

    // 添加DOMContentLoaded事件
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState === 'complete') {
        document.dispatchEvent(new Event('DOMContentLoaded', {
          bubbles: true
        }))
      }
    })
  }
})(window)
