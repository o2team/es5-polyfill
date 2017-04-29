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
    Object.getPrototypeOf = function getPrototypeOf (object) {
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
    Object.keys = function keys (object) {
      if (object !== Object(object)) { throw TypeError('Object.keys called on non-object: ' + object); }
      var keys = [];
      for (var p in object) {
        if (Object.prototype.hasOwnProperty.call(object, p)) {
          keys.push(p);
        }
      }
      return keys;
    };
  }

  if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames (object) {
      if (object !== Object(object)) {
        throw TypeError('Object.getOwnPropertyNames called on non-object: ' + object)
      }
      return Object.keys(object)
    }
  }

  var doesGetOwnPropertyDescriptorWork = function doesGetOwnPropertyDescriptorWork (object) {
    try {
      object.sentinel = 0
      return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0
    } catch (err) {
      return false
    }
  }
  var getOwnPropertyDescriptorFallback
  // check whether getOwnPropertyDescriptor works if it's given. Otherwise, shim partially
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
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor (object, property) {
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
            descriptor.get = getter;
          }
          if (setter) {
            descriptor.set = setter;
          }
          return descriptor
        }
      }
      descriptor.value = object[property]
      descriptor.writable = true
      return descriptor
    }
  }

  var doesDefinePropertyWork = function doesDefinePropertyWork (object) {
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
    Object.defineProperty = function defineProperty (object, property, descriptor) {
      if (isPrimitive(object)) {
        throw new TypeError(ERR_NON_OBJECT_TARGET + object)
      }
      if (isPrimitive(descriptor)) {
        throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor)
      }
      if (definePropertyFallback) {
        try {
          return definePropertyFallback.call(Object, object, property, descriptor);
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
    Object.defineProperties = function defineProperties (object, properties) {
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
    Object.create = function create (prototype, properties) {
      var object
      var Type = function Type () {}
      Type.prototype = prototype
      object = new Type()
      if (prototype) {
        object.constructor = Type
      }
      if (properties !== undefined) {
        if (properties !== Object(properties)) {
          throw TypeError()
        }
        Object.defineProperties(object, properties)
      }
      return object
    }
  }
})()