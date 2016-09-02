const gulp = require('gulp');

gulp.task('dev', ['build', 'watch']);
gulp.task('build', ['js', 'resources']);
gulp.task('dist', ['dist-js', 'dist-resources']);

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
    return gulp.src(['manifest.json', 'resources/*']).pipe(gulp.dest('gen'));
});

gulp.task('clean', function() {
    const del = require('del');
    return del.sync(['gen', 'dist']);
});

gulp.task('dist-js', function() {
    const browserify = require('browserify');
    const source = require('vinyl-source-stream');

    const bundle = browserify('./app/extension/index.js');
    return bundle.bundle()
        .pipe(source('index.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('dist-resources', function() {
    return gulp.src(['manifest.json', 'resources/*']).pipe(gulp.dest('dist'));
});