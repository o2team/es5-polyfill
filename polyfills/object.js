/**
 * polyfill for Object
 */

// from https://github.com/es-shims/es5-shim/blob/master/es5-sham.js
(function () {
  var prototypeOfObject = Object.prototype
  var call = Function.call
  var owns = call.bind(prototypeOfObject.hasOwnProperty)
  var isEnumerable = call.bind(prototypeOfObject.propertyIsEnumerable)
  var toStr = call.bind(prototypeOfObject.toString)

  var defineGetter
  var defineSetter
  var lookupGetter
  var lookupSetter
  var supportsAccessors = owns(prototypeOfObject, '__defineGetter__')
  if (supportsAccessors) {
    /* eslint-disable no-underscore-dangle, no-restricted-properties */
    defineGetter = call.bind(prototypeOfObject.__defineGetter__)
    defineSetter = call.bind(prototypeOfObject.__defineSetter__)
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__)
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__)
    /* eslint-enable no-underscore-dangle, no-restricted-properties */
  }

  var isPrimitive = function isPrimitive(o) {
    return o == null || (typeof o !== 'object' && typeof o !== 'function')
  }

  if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function getPrototypeOf(object) {
      var proto = object.__proto__
      if (proto || proto === null) {
        return proto
      }
      if (toStr(object.constructor) === '[object Function]') {
        return object.constructor.prototype
      }
      if (object instanceof Object) {
        return prototypeOfObject
      }
      return null
    }
  }

  if (!Object.keys) {
    Object.keys = (function() {
      var hasOwnProperty = Object.prototype.hasOwnProperty
      var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString')
      var dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ]
      var dontEnumsLength = dontEnums.length

      return function (obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object')
        }
        var result = [], prop, i

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop)
          }
        }
        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i])
            }
          }
        }
        return result
      }
    }())
  }

  if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
      if (object !== Object(object)) {
        throw TypeError('Object.getOwnPropertyNames called on non-object: ' + object)
      }
      return Object.keys(object)
    }
  }

  var doesGetOwnPropertyDescriptorWork = function doesGetOwnPropertyDescriptorWork(object) {
    try {
      object.sentinel = 0
      return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0
    } catch (err) {
      return false
    }
  }
  var getOwnPropertyDescriptorFallback
  if (Object.defineProperty) {
    var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork({})
    var getOwnPropertyDescriptorWorksOnDom = typeof document === 'undefined' ||
      doesGetOwnPropertyDescriptorWork(document.createElement('div'))
    if (!getOwnPropertyDescriptorWorksOnDom || !getOwnPropertyDescriptorWorksOnObject) {
      getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor
    }
  }
  if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {
    var ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: '
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
      if (isPrimitive(object)) {
        throw new TypeError(ERR_NON_OBJECT + object)
      }
      if (getOwnPropertyDescriptorFallback) {
        try {
          return getOwnPropertyDescriptorFallback.call(Object, object, property)
        } catch (err) {

        }
      }
      var descriptor
      if (!owns(object, property)) {
        return descriptor
      }
      descriptor = {
        enumerable: isEnumerable(object, property),
        configurable: true
      }
      if (supportsAccessors) {
        var prototype = object.__proto__
        var notPrototypeOfObject = object !== prototypeOfObject
        if (notPrototypeOfObject) {
          object.__proto__ = prototypeOfObject
        }
        var getter = lookupGetter(object, property)
        var setter = lookupSetter(object, property)
        if (notPrototypeOfObject) {
          object.__proto__ = prototype
        }
        if (getter || setter) {
          if (getter) {
            descriptor.get = getter
          }
          if (setter) {
            descriptor.set = setter
          }
          return descriptor
        }
      }
      descriptor.value = object[property]
      descriptor.writable = true
      return descriptor
    }
  }

  var doesDefinePropertyWork = function doesDefinePropertyWork(object) {
    try {
      Object.defineProperty(object, 'sentinel', {})
      return 'sentinel' in object
    } catch (exception) {
      return false
    }
  }

  if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({})
    var definePropertyWorksOnDom = typeof document === 'undefined' ||
      doesDefinePropertyWork(document.createElement('div'))
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
      var definePropertyFallback = Object.defineProperty
      var definePropertiesFallback = Object.defineProperties
    }
  }

  if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: '
    var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: '
    var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine'
    Object.defineProperty = function defineProperty(object, property, descriptor) {
      if (isPrimitive(object)) {
        throw new TypeError(ERR_NON_OBJECT_TARGET + object)
      }
      if (isPrimitive(descriptor)) {
        throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor)
      }
      if (definePropertyFallback) {
        try {
          return definePropertyFallback.call(Object, object, property, descriptor)
        } catch (exception) {
        }
      }
      if ('value' in descriptor) {
        if (supportsAccessors && (lookupGetter(object, property) || lookupSetter(object, property))) {
          var prototype = object.__proto__
          object.__proto__ = prototypeOfObject
          delete object[property]
          object[property] = descriptor.value
          object.__proto__ = prototype
        } else {
          object[property] = descriptor.value
        }
      } else {
        var hasGetter = 'get' in descriptor
        var hasSetter = 'set' in descriptor
        if (!supportsAccessors && (hasGetter || hasSetter)) {
          throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED)
        }
        // If we got that far then getters and setters can be defined !!
        if (hasGetter) {
          defineGetter(object, property, descriptor.get)
        }
        if (hasSetter) {
          defineSetter(object, property, descriptor.set)
        }
      }
      return object
    }
  }

  if (!Object.defineProperties || definePropertiesFallback) {
    Object.defineProperties = function defineProperties(object, properties) {
      if (definePropertiesFallback) {
        try {
          return definePropertiesFallback.call(Object, object, properties)
        } catch (exception) {
        }
      }
      var keys = Object.keys(properties)
      for (var i = 0; i < keys.length; i++) {
        var property = keys[i]
        if (property !== '__proto__') {
          Object.defineProperty(object, property, properties[property])
        }
      }
      return object
    }
  }

  if (!Object.create) {
    var createEmpty
    var supportsProto = !({ __proto__: null } instanceof Object)
    /* global ActiveXObject */
    var shouldUseActiveX = function () {
      if (!document.domain) {
        return false
      }
      try {
        return !!new ActiveXObject('htmlfile')
      } catch (exception) {
        return false
      }
    }

    var getEmptyViaActiveX = function () {
      var empty
      var xDoc
      xDoc = new ActiveXObject('htmlfile')
      var script = 'script'
      xDoc.write('<' + script + '></' + script + '>')
      xDoc.close()

      empty = xDoc.parentWindow.Object.prototype
      xDoc = null

      return empty
    }

    var getEmptyViaIFrame = function () {
      var iframe = document.createElement('iframe')
      var parent = document.body || document.documentElement
      var empty

      iframe.style.display = 'none'
      parent.appendChild(iframe)
      // eslint-disable-next-line no-script-url
      iframe.src = 'javascript:'

      empty = iframe.contentWindow.Object.prototype
      parent.removeChild(iframe)
      iframe = null

      return empty
    }

    /* global document */
    if (supportsProto || typeof document === 'undefined') {
      createEmpty = function () {
        return { __proto__: null }
      }
    } else {
      createEmpty = function () {
        var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame()

        delete empty.constructor
        delete empty.hasOwnProperty
        delete empty.propertyIsEnumerable
        delete empty.isPrototypeOf
        delete empty.toLocaleString
        delete empty.toString
        delete empty.valueOf

        var Empty = function Empty() { }
        Empty.prototype = empty
        // short-circuit future calls
        createEmpty = function () {
          return new Empty()
        }
        return new Empty()
      }
    }

    Object.create = function create (prototype, properties) {
      var object
      var Type = function () { }
      if (prototype === null) {
        object = createEmpty()
      } else {
        if (prototype !== null && isPrimitive(prototype)) {
          throw new TypeError('Object prototype may only be an Object or null')
        }
        Type.prototype = prototype
        object = new Type()
        object.__proto__ = prototype
      }

      if (properties !== void 0) {
        Object.defineProperties(object, properties)
      }

      return object
    }
  }

  if (!Object.seal) {
    Object.seal = function seal(object) {
      if (Object(object) !== object) {
        throw new TypeError('Object.seal can only be called on Objects.')
      }
      return object
    }
  }

  if (!Object.freeze) {
    Object.freeze = function freeze(object) {
      if (Object(object) !== object) {
        throw new TypeError('Object.freeze can only be called on Objects.')
      }
      return object
    }
  }

  try {
    Object.freeze(function () { })
  } catch (exception) {
    Object.freeze = (function (freezeObject) {
      return function freeze(object) {
        if (typeof object === 'function') {
          return object
        }
        return freezeObject(object)
      }
    })(Object.freeze)
  }

  if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
      if (Object(object) !== object) {
        throw new TypeError('Object.preventExtensions can only be called on Objects.')
      }
      return object
    }
  }

  if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
      if (Object(object) !== object) {
        throw new TypeError('Object.isSealed can only be called on Objects.')
      }
      return false
    }
  }

  if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
      if (Object(object) !== object) {
        throw new TypeError('Object.isFrozen can only be called on Objects.')
      }
      return false
    }
  }

  if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
      if (Object(object) !== object) {
        throw new TypeError('Object.isExtensible can only be called on Objects.')
      }
      var name = ''
      while (owns(object, name)) {
        name += '?'
      }
      object[name] = true
      var returnValue = owns(object, name)
      delete object[name]
      return returnValue
    }
  }
})()
