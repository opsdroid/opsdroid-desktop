'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell')
var sass = require('gulp-sass');
var electron = require('electron-connect').server.create();

gulp.task('serve', function () {

  // Compile the sass
  gulp.start('sass');

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['index.js', 'index.html', 'index.scss'], function(){
    gulp.start('sass');
    electron.reload()
  });
});

gulp.task('build', shell.task([
  'electron-packager . --overwrite --platform=darwin --icon=assets/icons/mac/icon.icns --arch=x64 --prune=true --out=release_builds'
]))

gulp.task('sass', function () {
  return gulp.src('./*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./'));
});
