const gulp = require('gulp');

const entryPoints = [
    'background',
    'onboard-popup',
    'funded-popup',
    'main-popup'
];

gulp.task('dev', ['build', 'watch']);
gulp.task('build', ['js', 'resources']);
gulp.task('dist', ['dist-js', 'dist-resources']);

gulp.task('watch', function () {
    gulp.watch('app/**', ['js']);
    gulp.watch(['manifest.json', 'resources/**'], ['resources']);
});

gulp.task('js', function (done) {
    const browserify = require('browserify');
    const incremental = require('browserify-incremental');
    const source = require('vinyl-source-stream');
    const es = require('event-stream');

    function compile(filename) {
        const opts = {
            debug: true,
            cacheFile: `./gen/${filename}.js.cache`
        };

        const bundle = browserify(`./app/extension/${filename}.js`, Object.assign(opts, incremental.args));
        incremental(bundle);
        return bundle.bundle()
            .on('error', function (e) {
                done(e);
            })
            .pipe(source(`${filename}.js`))
            .pipe(gulp.dest('gen'));
    }

    return es.merge(entryPoints.map((file) => compile(file)));
});

gulp.task('resources', function () {
    return gulp.src(['manifest.json', 'resources/*']).pipe(gulp.dest('gen'));
});

gulp.task('clean', function () {
    const del = require('del');
    return del.sync(['gen', 'dist']);
});

gulp.task('dist-js', function () {
    const browserify = require('browserify');
    const source = require('vinyl-source-stream');
    const es = require('event-stream');

    function compile(filename) {
        const bundle = browserify(`./app/extension/${filename}.js`);
        return bundle.bundle()
            .pipe(source(`${filename}.js`))
            .pipe(gulp.dest('dist'));
    }

    return es.merge(entryPoints.map((file) => compile(file)));
});

gulp.task('dist-resources', function () {
    return gulp.src(['manifest.json', 'resources/*']).pipe(gulp.dest('dist'));
});