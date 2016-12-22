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
var minifyCSS = require('gulp-clean-css');
var minifyHTML = require('gulp-minify-html');
var path = require('path');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var jsfiles = ['./src/js/script.js'];
var base64Opts = {
    extensions: ['png', /\.jpg#datauri$/i]
};

// Concat and compress CSS files in src/data/css, and generate build/production.css
gulp.task('css', function() {
    var opts = {
        keepBreaks: false,
        compatibility: 'ie8',
        keepSpecialComments: 0
    };

    return gulp.src('./src/less/style.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(concat('production.css'))
    .pipe(base64(base64Opts))
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('./src/rendered'));
});

// Concat and compress JS files in src/data/javascript, and generate build/production.js
gulp.task('js', function () {
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

// Validate src/data JSON files
gulp.task('jsonlint', function () {
    return gulp.src('./src/data/*.json')
    .pipe(jsonlint())
    .pipe(jsonlint.reporter());
});

// Render html using data in src/data against src/templates, and build src/html/index.html
gulp.task('template', ['jsonlint'], function (done) {
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
gulp.task('build', ['template', 'css'], function () {
    var optsHtml = {
      conditionals: true,
      spare: true
    };
    var optsInline = {
        swallowErrors: true
    };

    return gulp.src('./src/rendered/*.html')
    .pipe(base64(base64Opts))
    .pipe(inlinesource(optsInline))
    .pipe(minifyHTML(optsHtml))
    .pipe(gulp.dest('.'));
});

// Validate all JS files
gulp.task('lint', function() {
    return gulp.src('./src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});