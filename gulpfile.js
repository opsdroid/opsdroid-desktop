'use strict';

var gulp = require('gulp');
var babel = require("gulp-babel");
var shell = require('gulp-shell')
var sass = require('gulp-sass');
var electron = require('electron-connect').server.create();
var package_info = require('./package.json')

gulp.task('serve', function () {

  // Compile the JavaScript
  gulp.start('babel');

  // Compile the sass
  gulp.start('sass');

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['src/**/*.js', 'src/index.html', 'src/index.scss'], function(){
    gulp.start('babel');
    gulp.start('sass');
    electron.reload()
  });
});

gulp.task('build-all', shell.task([
  'electron-packager . --overwrite --platform=all --arch=all --prune=true --out=release_builds'
]));

gulp.task('build-mac', shell.task([
  'electron-packager . --overwrite --platform=darwin --icon=assets/icons/mac/icon.icns --arch=x64 --prune=true --out=release_builds'
]));

gulp.task('zip', shell.task([
  `zip -FSr release_builds/opsdroid-desktop-darwin-x64/opsdroid-desktop-${package_info.version}-macos-x64.zip release_builds/opsdroid-desktop-darwin-x64/opsdroid-desktop.app`
]));

gulp.task('sass', function () {
  return gulp.src('./src/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task("babel", function () {
  return gulp.src("./src/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("./dist/js"));
});
