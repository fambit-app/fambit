const gulp = require('gulp');

gulp.task('dev', ['build', 'watch']);
gulp.task('build', ['js', 'resources']);
gulp.task('dist', ['dist-js', 'dist-resources']);

gulp.task('watch', function() {
    gulp.watch('app/**', ['js']);
    gulp.watch(['manifest.json', 'resources/**'], ['resources']);
});

gulp.task('js', function() {
    const browserify = require('browserify');
    const incremental = require('browserify-incremental');
    const source = require('vinyl-source-stream');
   
   function compile(filename) {
           const opts = {
            debug: true,
            cacheFile: `./gen/${filename}.js.cache`
        };

        const bundle = browserify(`./app/extension/${filename}.js`, Object.assign(opts, incremental.args));
        incremental(bundle);
        return bundle.bundle()
            .pipe(source(`${filename}.js`))
            .pipe(gulp.dest('gen'));
   }
   
   compile('background');
   compile('popup');   
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

    const bundle = browserify('./app/extension/background.js');
    return bundle.bundle()
        .pipe(source('background.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('dist-resources', function() {
    return gulp.src(['manifest.json', 'resources/*']).pipe(gulp.dest('dist'));
});