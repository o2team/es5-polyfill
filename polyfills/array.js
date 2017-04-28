/**
 * polyfill for Array
 */

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]'
    }
    var toInteger = function (value) {
      var number = Number(value)
      if (isNaN(number)) { return 0 }
      if (number === 0 || !isFinite(number)) { return number }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number))
    }
    var maxSafeInteger = Math.pow(2, 53) - 1
    var toLength = function (value) {
      var len = toInteger(value)
      return Math.min(Math.max(len, 0), maxSafeInteger)
    }
    return function from (arrayLike) {
      var C = this
      var items = Object(arrayLike)
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined')
      }
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined
      var T
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function')
        }
        if (arguments.length > 2) {
          T = arguments[2]
        }
      }
      var len = toLength(items.length)
      var A = isCallable(C) ? Object(new C(len)) : new Array(len)
      var k = 0
      var kValue
      while (k < len) {
        kValue = items[k]
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k)
        } else {
          A[k] = kValue
        }
        k += 1
      }
      A.length = len;
      return A
    }
  }())
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/of
if (!Array.of) {
  Array.of = function() {
    return Array.prototype.slice.call(arguments)
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (callback, thisArg) {
    var T, k
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.forEach called on null or undefined')
    }
    var O = Object(this)
    var len = O.length >>> 0
    if (Object.prototype.toString.call(callback) != '[object Function]') {
      throw new TypeError(callback + ' is not a function')
    }
    if (arguments.length > 1) {
      T = thisArg
    }
    k = 0
    while (k < len) {
      var kValue
      if (k in O) {
        kValue = O[k]
        callback.call(T, kValue, k, O)
      }
      k++
    }
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin
if (!Array.prototype.copyWithin) {
  Array.prototype.copyWithin = function(target, start) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.copyWithin called on null or undefined')
    }

    var O = Object(this)

    var len = O.length >>> 0

    var relativeTarget = target >> 0

    var to = relativeTarget < 0 ?
      Math.max(len + relativeTarget, 0) :
      Math.min(relativeTarget, len)

    var relativeStart = start >> 0

    var from = relativeStart < 0 ?
      Math.max(len + relativeStart, 0) :
      Math.min(relativeStart, len)

    var end = arguments[2]
    var relativeEnd = end === undefined ? len : end >> 0

    var final = relativeEnd < 0 ?
      Math.max(len + relativeEnd, 0) :
      Math.min(relativeEnd, len)

    var count = Math.min(final - from, len - to)

    var direction = 1

    if (from < to && to < (from + count)) {
      direction = -1
      from += count - 1
      to += count - 1
    }

    while (count > 0) {
      if (from in O) {
        O[to] = O[from]
      } else {
        delete O[to]
      }

      from += direction
      to += direction
      count--
    }
    return O
  }
}

// form https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
  Array.prototype.every = function (callback) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.every called on null or undefined')
    }

    var O = Object(this)
    var len = O.length >>> 0
    if (Object.prototype.toString.call(callback) != '[object Function]') {
      throw new TypeError(callback + ' is not a function')
    }
    var ctx = arguments.length >= 2 ? arguments[1] : void 0
    for (var i = 0; i < len; i++) {
      if (i in O && !callback.call(ctx, O[i], i, O)) {
        return false
      }
    }

    return true
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
if (!Array.prototype.fill) {
  Array.prototype.fill = function (value) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.fill called on null or undefined')
    }
    var O = Object(this)
    var len = O.length >>> 0
    var start = arguments[1]
    var relativeStart = start >> 0
    var k = relativeStart < 0 ?
      Math.max(len + relativeStart, 0) :
      Math.min(relativeStart, len)

    var end = arguments[2]
    var relativeEnd = end === undefined ?
      len : 
      end >> 0

    var final = relativeEnd < 0 ?
      Math.max(len + relativeEnd, 0) :
      Math.min(relativeEnd, len)
    while(k < final) {
        O[k] = value
        k++
    }

    return O
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter) {
  Array.prototype.filter = function (callback) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.filter called on null or undefined')
    }
    var O = Object(this)
    var len = O.length >>> 0
    if (Object.prototype.toString.call(callback) != '[object Function]') {
      throw new TypeError(callback + ' is not a function')
    }
    var res = []
    var ctx = arguments.length >= 2 ? arguments[1] : void 0
    for (var i = 0; i < len; i++) {
      if (i in O) {
        var val = O[i]
        if (callback.call(ctx, val, i, O)) {
          res.push(val)
        }
      }
    }
    return res
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined')
    }
    if (Object.prototype.toString.call(callback) != '[object Function]') {
      throw new TypeError(predicate + ' must be a function')
    }
    var list = Object(this)
    var len = list.length >>> 0
    var ctx = arguments.length >= 2 ? arguments[1] : void 0
    var value
    for (var i = 0; i < len; i++) {
      value = list[i]
      if (predicate.call(ctx, value, i, list)) {
        return value
      }
    }
    return undefined
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function (predicate) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined')
    }
    if (Object.prototype.toString.call(callback) != '[object Function]') {
      throw new TypeError(predicate + ' must be a function')
    }
    var list = Object(this)
    var len = list.length >>> 0
    var ctx = arguments.length >= 2 ? arguments[1] : void 0
    var value
    for (var i = 0; i < len; i++) {
      value = list[i]
      if (predicate.call(ctx, value, i, list)) {
        return i
      }
    }
    return -1
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.includes called on null or undefined')
    }
    var O = Object(this)
    var len = O.length >>> 0

    if (len === 0) {
      return false
    }
    var n = fromIndex | 0

    var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)

    while (k < len) {
      if (O[k] === searchElement) {
        return true
      }
      k++
    }
    return false
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement, fromIndex) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.indexOf called on null or undefined')
    }
    var k
    var O = Object(this)
    var len = O.length >>> 0
    if (len === 0) {
      return -1
    }
    var n = fromIndex | 0
    if (n >= len) {
      return -1
    }
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)
    while (k < len) {
      if (k in O && O[k] === searchElement) {
        return k
      }
      k++
    }
    return -1
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = function(searchElement) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.lastIndexOf called on null or undefined')
    }
    var n, k
    var t = Object(this)
    var len = t.length >>> 0
    if (len === 0) {
      return -1
    }
    n = len - 1
    if (arguments.length > 1) {
      n = Number(arguments[1])
      if (n !== n) {
        n = 0
      } else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n))
      }
    }
    k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n)
    for (;k >= 0; k--) {
      if (k in t && t[k] === searchElement) {
        return k
      }
    }
    return -1
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map
if (!Array.prototype.map) {
  Array.prototype.map = function (callback, thisArg) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.map called on null or undefined')
    }
    var T, A, k
    var O = Object(this)
    var len = O.length >>> 0
    if (Object.prototype.toString.call(callback) !== '[object Function]') {
      throw new TypeError(callback + ' is not a function')
    }
    if (thisArg) {
      T = thisArg
    }
    A = new Array(len)
    k = 0
    while(k < len) {
      var kValue, mappedValue
      if (k in O) {
        kValue = O[k]
        mappedValue = callback.call(T, kValue, k, O)
        A[ k ] = mappedValue
      }
      k++
    }
    return A
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function (callback) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined')
    }
    if (Object.prototype.toString.call(callback) !== '[object Function]') {
      throw new TypeError(callback + ' is not a function')
    }
    var t = Object(this), len = t.length >>> 0, k = 0, value
    if (arguments.length >= 2) {
      value = arguments[1]
    } else {
      while (k < len && !(k in t)) {
        k++
      }
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value')
      }
      value = t[k++]
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t)
      }
    }
    return value
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
if (!Array.prototype.reduceRight) {
  Array.prototype.reduceRight = function (callback) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.reduceRight called on null or undefined')
    }
    if (Object.prototype.toString.call(callback) !== '[object Function]') {
      throw new TypeError(callback + ' is not a function')
    }
    var t = Object(this), len = t.length >>> 0, k = len - 1, value
    if (arguments.length >= 2) {
      value = arguments[1]
    } else {
      while (k >= 0 && !(k in t)) {
        k--
      }
      if (k < 0) {
        throw new TypeError('Reduce of empty array with no initial value')
      }
      value = t[k--]
    }
    for (; k >= 0; k--) {
      if (k in t) {
        value = callback(value, t[k], k, t)
      }
    }
    return value
  }
}

// from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
  Array.prototype.some = function (callback) {
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.reduceRight called on null or undefined')
    }
    if (Object.prototype.toString.call(callback) !== '[object Function]') {
      throw new TypeError(callback + ' is not a function')
    }
    var t = Object(this)
    var len = t.length >>> 0
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0
    for (var i = 0; i < len; i++) {
      if (i in t && fun.call(thisArg, t[i], i, t)) {
        return true
      }
    }
    return false
  }
}