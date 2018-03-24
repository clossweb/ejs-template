var gulp = require('gulp');
var nunjucks = require('gulp-nunjucks-html');
//var data = require('gulp-data');
var compass = require('gulp-compass');
//var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
// Optimizing images
var Imagemin = require('gulp-imagemin');
//var staticHash = require('gulp-static-hash');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var ctrl = {
    main: {
        origin: null,
        output: null,
        process: null,
        default: null,
        openBS: false,
        html: {
            serve: {},
            nunjucks: {
                origin: null,
                output: null,
                originFile: []
            }
        },
        js: {
            origin: null,
            output: null,
            uglify: {},
            concat_js: {}
        },
        css: {
            origin: null,
            output: null,
            compass: {},
            concat: {},
            minify_css: {}
        },
        image: {
            imageMin: {}
        }
    }
};

ctrl.main.origin = './';
ctrl.main.output = './public';
ctrl.main.process = './handle';
//ctrl.main.openBS = true;

ctrl.main.default = ['serve'];
//['endMove-css', 'endMove-js', 'imageMin', 'nunjucks']
ctrl.main.html.serve.enabled = ['endMove-css', 'imageMin'];

ctrl.main.html.nunjucks.origin = './templates';
ctrl.main.html.nunjucks.output = './app';
ctrl.main.html.nunjucks.searchPath = 'templates';
ctrl.main.html.nunjucks.outputFile = [ctrl.main.html.nunjucks.output + '/*.html'];

ctrl.main.html.nunjucks.originFile[0] = [ctrl.main.html.nunjucks.origin + '/*.html', ctrl.main.html.nunjucks.origin + '/*/*.html'];
ctrl.main.html.nunjucks.originFile[1] = ctrl.main.html.nunjucks.originFile[0]
    .concat(['!' + ctrl.main.html.nunjucks.origin + '/base.html']);


ctrl.main.js.uglify.origin = ctrl.main.origin + '/js';
ctrl.main.js.uglify.output = ctrl.main.process + '/js/Cjs';
ctrl.main.js.uglify.originFile = [
ctrl.main.js.concat_js.origin + '/app.js',
ctrl.main.js.concat_js.origin + '/main.js',
ctrl.main.js.concat_js.origin + '/material.js',
ctrl.main.js.concat_js.origin + '/map_app.js'
//ctrl.main.js.uglify.origin + '/*.js'
];
ctrl.main.js.concat_js.origin = ctrl.main.process + '/js/Cjs';
ctrl.main.js.concat_js.output = ctrl.main.process + '/js/CMjs';
ctrl.main.js.concat_js.originFile = [
ctrl.main.js.concat_js.origin + '/app.min.js',
ctrl.main.js.concat_js.origin + '/main.min.js',
ctrl.main.js.concat_js.origin + '/material.min.js'
];
ctrl.main.js.concat_js.outputFile = './main.min.js';


ctrl.main.css.compass.origin = ctrl.main.origin + '/sass';
ctrl.main.css.compass.output = ctrl.main.process + '/css/Ocss';
ctrl.main.css.compass.originFile = ctrl.main.css.compass.origin + '/*.scss';

ctrl.main.css.minify_css.origin = ctrl.main.process + '/css/Ocss';
ctrl.main.css.minify_css.output = ctrl.main.process + '/css/OCcss';
ctrl.main.css.minify_css.originFile = ctrl.main.css.minify_css.origin + '/*.css';

ctrl.main.css.concat.origin = ctrl.main.process + '/css/OCcss';
ctrl.main.css.concat.output = ctrl.main.process + '/css/OCMcss';
ctrl.main.css.concat.originFile = ctrl.main.css.concat.origin + '/*.min.css';
ctrl.main.css.concat.outputFile = './style.min.css';

ctrl.main.image.imageMin.origin = ctrl.main.origin + '/images';
ctrl.main.image.imageMin.output = ctrl.main.output + '/images';
ctrl.main.image.imageMin.originFile = ctrl.main.image.imageMin.origin + '/*.{jpg,png}';
ctrl.main.image.imageMin.outputFile = ctrl.main.image.imageMin.output + '/*.{jpg,png}';

ctrl.main.js.originFile = ctrl.main.js.concat_js.output + '/*.js';
ctrl.main.js.output = ctrl.main.output + '/js';

ctrl.main.css.originFile = ctrl.main.css.concat.output + '/*.css';
ctrl.main.css.output = ctrl.main.output + '/css';


function swallowError(error) { // details of the error in the console
    console.log(error.toString());
    this.emit('end');
}

// Static Server + watching scss/html files
gulp.task('serve', ctrl.main.html.serve.enabled, function () {
    if (ctrl.main.openBS) {
        browserSync.init({
            server: ctrl.main.html.nunjucks.output
        });
    }
    gulp.watch(ctrl.main.html.nunjucks.originFile[0], ['nunjucks']);
    gulp.watch(ctrl.main.css.compass.originFile, ['endMove-css']);
    gulp.watch(ctrl.main.js.uglify.originFile, ['endMove-js']);
    gulp.watch(ctrl.main.image.imageMin.originFile, ['imageMin']);
    gulp.watch(ctrl.main.html.nunjucks.outputFile).on('change', reload);
});


gulp.task('nunjucks', function () {
    return gulp.src(ctrl.main.html.nunjucks.originFile[1])
        .pipe(
        nunjucks({
            locals: {username: 'James'},
            searchPaths: [ctrl.main.html.nunjucks.searchPath]
        })
    )
        .on('error', swallowError)
        .pipe(gulp.dest(ctrl.main.html.nunjucks.output));
});
// Compile sass into CSS & auto-inject into browsers

gulp.task('compass', function () {
    return gulp.src(ctrl.main.css.compass.originFile)
        .pipe(compass({
            config_file: './config.rb',
            includePaths: ['node_modules/motion-ui/src'],
            css: ctrl.main.css.compass.output,
            sass: ctrl.main.css.compass.origin,
            sourcemap: true
        }))
        .pipe(gulp.dest(ctrl.main.css.compass.output));
});

gulp.task('minify-css', ['compass'], function () {
    return gulp.src(ctrl.main.css.minify_css.originFile)
        .pipe(minifyCSS({
            keepBreaks: true
        }))
        .pipe(rename(function (path) {
            path.basename += ".min";
            path.extname = ".css";
        }))
        .on('error', swallowError)
        .pipe(gulp.dest(ctrl.main.css.minify_css.output));
});

gulp.task('concat-css', ['minify-css'], function () {
    return gulp.src(ctrl.main.css.concat.originFile)
        .pipe(concat(ctrl.main.css.concat.outputFile))
        .pipe(gulp.dest(ctrl.main.css.concat.output));
});

gulp.task('imageMin', function () {
    var imageWatcher = gulp.watch(ctrl.main.image.imageMin.originFile);
    imageWatcher.on('change', function (event) {
        if (event.type == "added") {
            console.log("optimizing image: " + event.path);
            gulp.src(event.path)
                //.pipe(Imagemin())
                .pipe(gulp.dest(ctrl.main.image.imageMin.output));
        }
    });
});

gulp.task('concat-js', ['uglify'], function () {
    return gulp.src(ctrl.main.js.concat_js.originFile)
        .pipe(concat(ctrl.main.js.concat_js.outputFile))
        .pipe(gulp.dest(ctrl.main.js.concat_js.output));
});

gulp.task('uglify', function () {
    return gulp.src(ctrl.main.js.uglify.originFile)
        .pipe(uglify())
        .pipe(rename(function (path) {
        	console.log(ctrl.main.js.uglify.originFile);
            if (path.basename.search('.min') >= 0) {
                path = {};
                return;
            }
            path.basename += ".min";
            path.extname = ".js";
        }))
        .on('error', swallowError)
        .pipe(gulp.dest(ctrl.main.js.uglify.output));
});


gulp.task('endMove-js', ['concat-js'], function () {
    return gulp.src(ctrl.main.js.originFile)
        .pipe(gulp.dest(
            ctrl.main.js.output
        ))
        .pipe(reload({stream: true}))
});

gulp.task('endMove-css', ['concat-css'], function () {
    return gulp.src(ctrl.main.css.originFile)
        .pipe(gulp.dest(
            ctrl.main.css.output
        ))
        .pipe(reload({stream: true}))
});

gulp.task('default', ctrl.main.default);
