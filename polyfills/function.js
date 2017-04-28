// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable')
    }
    var args = Array.prototype.slice.call(arguments, 1)
    var fToBind = this
    var fNOP = function () {}
    var fBound = function () {
      return fToBind.apply(this instanceof fNOP ? this : oThis, args.concat(Array.prototype.slice.call(arguments)))
    }

    if (this.prototype) {
      fNOP.prototype = this.prototype
    }
    fBound.prototype = new fNOP()
    return fBound
  }
}

