const gulp = require('gulp')
const bs = require('browser-sync').create()

gulp.task('browser-sync', function() {
    bs.init({
        server: {
            baseDir: "./"
        }
    })
})

gulp.task('watch', gulp.series('browser-sync', function() {
  gulp.watch("css/*.css").on('change', bs.reload)
  gulp.watch("js/*.js").on('change', bs.reload)
  gulp.watch("*.html").on('change', bs.reload)
}))

gulp.task('auto', gulp.series('browser-sync', 'watch'));
