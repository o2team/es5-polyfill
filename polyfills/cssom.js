//----------------------------------------------------------------------
//
// CSSOM View Module
// https://dev.w3.org/csswg/cssom-view/
//
//----------------------------------------------------------------------

// Fix for IE8-'s Element.getBoundingClientRect()
if ('TextRectangle' in window && !('width' in window.TextRectangle.prototype)) {
  Object.defineProperties(window.TextRectangle.prototype, {
    'width': { get () { return this.right - this.left } },
    'height': { get () { return this.bottom - this.top } }
  })
}