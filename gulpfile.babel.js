import path from 'path'
import gulp from 'gulp'
import concat from 'gulp-concat'
import semi from 'gulp-semi'
import uglify from 'gulp-uglify'
import rename from 'gulp-rename'

const SRC = path.join(__dirname, 'polyfills', '**/*.js')
const DIST = path.join(__dirname, 'dist')

gulp.task('concat', () => {
  return gulp.src(SRC)
    .pipe(semi.add({ leading: true }))
    .pipe(concat('polyfill.js'))
    .pipe(gulp.dest(DIST))
    .pipe(uglify())
    .pipe(rename({
      basename: 'polyfill.min'
    }))
    .pipe(gulp.dest(DIST))
})

gulp.task('default', ['concat'])