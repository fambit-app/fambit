const gulp = require('gulp');

gulp.task('build', ['js', 'resources']);

gulp.task('js', function() {
    const browserify = require('browserify');
    const source = require('vinyl-source-stream');
    return browserify('./app/extension/index.js')
        .bundle()
        .pipe(source('index.js'))
        .pipe(gulp.dest('gen'));
});

gulp.task('resources', function() {
    gulp.src(['manifest.json', 'resources/*']).pipe(gulp.dest('gen'));
});