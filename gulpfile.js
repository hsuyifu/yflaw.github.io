'use strict';

var base64 = require('gulp-base64');
var concat = require('gulp-concat');
var fs = require('fs');
var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var inlinesource = require('gulp-inline-source');
var jshint = require('gulp-jshint');
var jsonlint = require("gulp-jsonlint");
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var path = require('path');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var cssfiles = ['./src/css/normalize.css', './src/css/bricks.css'];
var jsfiles = ['./src/js/script.js'];

gulp.task('less', function() {
    return gulp.src('./src/less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./src/css/'));
});

// Concat and compress CSS files in src/data/css, and generate build/production.css
gulp.task('minify-css', ['less'], function() {
    var opts = {
        keepBreaks: false,
        compatibility: 'ie8',
        keepSpecialComments: 0
    };
    var cssfilesToBuild = cssfiles;
    return gulp.src(cssfilesToBuild)
    .pipe(concat('production.css'))
    .pipe(base64())
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('./src/rendered'));
});

// Copy build/production.js and build/production.css into src/html/index.html, compress html, and generate build/index.html
gulp.task('copy-css', ['less'], function () {
    var cssfilesToBuild = cssfiles;
    return gulp.src(cssfilesToBuild)
    .pipe(concat('production.css'))
    .pipe(base64())
    .pipe(gulp.dest('./src/rendered'));
});

// Concat and compress JS files in src/data/javascript, and generate build/production.js
gulp.task('minify-js', function () {
    var jsfilesToBuild;
    if (jsfiles === [] || typeof jsfiles === 'undefined') {
        jsfilesToBuild = './src/js/production.js';
    } else {
        jsfilesToBuild = jsfiles;
    }
    return gulp.src(jsfilesToBuild)
    .pipe(concat('production.js'))
    .pipe(uglify({mangle: true}))
    .pipe(gulp.dest('./src/rendered'));
});

// Copy build/production.js and build/production.css into src/html/index.html, compress html, and generate build/index.html
gulp.task('copy-js', function () {
    return gulp.src('./src/js/*.js')
    .pipe(gulp.dest('./src/rendered'));
});

// Validate src/data JSON files
gulp.task('jsonlint', function () {
    return gulp.src('./src/data/*.json')
    .pipe(jsonlint())
    .pipe(jsonlint.reporter());
});

// Render html using data in src/data against src/templates, and build src/html/index.html
gulp.task('render-template', ['jsonlint'], function (done) {
   var filepath = path.join(__dirname, './src/data/data-structure.json');
   var options = {
       ignorePartials: true,
       batch : ['./src/templates/partials']
   };

   fs.readFile(filepath, {encoding: 'utf-8'}, function (err, D) {
       var data;
        if (err) {
            console.log('error: ', err);
            return;
        }
        data = JSON.parse(D);
        gulp.src('./src/templates/index.handlebars')
        .pipe(handlebars(data, options))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./src/rendered'))
        .on('end', done); 
        return;
   });

});
gulp.task('build', ['render-template', 'minify-js', 'minify-css'], function () {
    var optsHtml = {
      conditionals: true,
      spare: true
    };
    var optsInline = {
        swallowErrors: true
    };

    return gulp.src('./src/rendered/*.html')
    .pipe(base64())
    .pipe(inlinesource(optsInline))
    .pipe(minifyHTML(optsHtml))
    .pipe(gulp.dest('.'));
});

// Copy build/production.js and build/production.css into src/html/index.html, compress html, and generate build/index.html
gulp.task('copy-and-compress', ['render-template', 'minify-js', 'minify-css'], function (done) {
    return gulp.src('./src/rendered/*')
    .pipe(gulp.dest('.'));
});

// Validate all JS files
gulp.task('lint', function() {
    return gulp.src('./src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});