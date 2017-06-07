'use strict';

var gulp = require('gulp');
var babel = require("gulp-babel");
var shell = require('gulp-shell')
var sass = require('gulp-sass');
var electron = require('electron-connect').server.create();
var package_info = require('./package.json')

gulp.task('serve', function () {
  // Compile
  gulp.start('compile');

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['src/**/*.js', 'src/**/*.html', 'src/**/*.scss'], function(){
    // Recompile
    gulp.start('compile');
    electron.reload()
  });
});

gulp.task('build-all', shell.task([
  'electron-packager . --overwrite --platform=all --arch=all --prune=true --out=release_builds'
]));

gulp.task('build-linux', shell.task([
  'electron-packager . --overwrite --platform=linux --icon=assets/icons/icon.png --arch=all --prune=true --out=release_builds'
]));

gulp.task('build-mac', shell.task([
  'electron-packager . --overwrite --platform=darwin --icon=assets/icons/icon.icns --arch=x64 --prune=true --out=release_builds'
]));

gulp.task('zip', shell.task([
  `if [ -d "release_builds/opsdroid-desktop-darwin-x64" ]; then cd release_builds/opsdroid-desktop-darwin-x64 && zip -FSr opsdroid-desktop-${package_info.version}-macos-x64.zip opsdroid-desktop.app; fi`,
  `if [ -d "release_builds/opsdroid-desktop-linux-x64" ]; then cd release_builds/opsdroid-desktop-linux-x64 && tar -cvzf opsdroid-desktop-${package_info.version}-linux-x64.tar.gz *; fi`,
  `if [ -d "release_builds/opsdroid-desktop-linux-ia32" ]; then cd release_builds/opsdroid-desktop-linux-ia32 && tar -cvzf opsdroid-desktop-${package_info.version}-linux-i386.tar.gz *; fi`,
  `if [ -d "release_builds/opsdroid-desktop-linux-armv7l" ]; then cd release_builds/opsdroid-desktop-linux-armv7l && tar -cvzf opsdroid-desktop-${package_info.version}-linux-armv7l.tar.gz *; fi`
]));

gulp.task('sass', function () {
  return gulp.src('./src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
});

gulp.task("babel", function () {
  return gulp.src("./src/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("./dist"));
});

gulp.task("compile", function() {
  // Compile the JavaScript
  gulp.start('babel');

  // Compile the sass
  gulp.start('sass');
})

gulp.task('default', ['serve']);
