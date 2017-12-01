import path from 'path'
import fs from 'fs'
import gulp from 'gulp'
import concat from 'gulp-concat'
import semi from 'gulp-semi'
import uglify from 'gulp-uglify'
import rename from 'gulp-rename'

const SRC = path.join(__dirname, 'polyfills')
const DIST = path.join(__dirname, 'dist')
const polyfillFiles = fs.readdirSync(SRC)
const preFiles = ['function.js', 'object.js']
let newOrderFiles = []
newOrderFiles = polyfillFiles.filter(file => preFiles.indexOf(file) < 0)
newOrderFiles = preFiles.concat(newOrderFiles)

gulp.task('concat', () => {
  return gulp.src(newOrderFiles.map(file => path.join(SRC, file)))
    .pipe(semi.add({ leading: true }))
    .pipe(concat('polyfill.js'))
    .pipe(gulp.dest(DIST))
    .pipe(uglify({
      beautify: false,
      mangle: {
        screw_ie8: false,
        keep_fnames: true,
        properties: false,
        keep_quoted: true
      },
      compress: {
        warnings: false,
        screw_ie8: false,
        properties: false
      },
      output: {
        keep_quoted_props: true
      },
      comments: false
    }))
    .pipe(rename({
      basename: 'polyfill.min'
    }))
    .pipe(gulp.dest(DIST))
})

gulp.task('default', ['concat'])
