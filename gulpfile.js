const gulp = require('gulp');

gulp.task('dev', ['build', 'watch']);
gulp.task('build', ['js', 'resources']);

gulp.task('watch', function() {
    gulp.watch('app/**', ['js']);
    gulp.watch('resources/**', ['resources']);
});

gulp.task('js', function() {
    const browserify = require('browserify');
    const incremental = require('browserify-incremental');
    const source = require('vinyl-source-stream');
    const opts = {
        debug: true,
        cacheFile: './gen/index.js.cache'
    };

    const bundle = browserify('./app/extension/index.js', Object.assign(opts, incremental.args));
    incremental(bundle);
    return bundle.bundle()
        .pipe(source('index.js'))
        .pipe(gulp.dest('gen'));
});

gulp.task('resources', function() {
    gulp.src(['manifest.json', 'resources/*']).pipe(gulp.dest('gen'));
});