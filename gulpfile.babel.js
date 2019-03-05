import gulp from 'gulp';
import plumber from 'gulp-plumber';
import htmlmin from 'gulp-htmlmin';
import sassglob from 'gulp-sass-glob';
import sass from 'gulp-sass';
import cssnano from 'gulp-cssnano';
import autoprefixer from 'gulp-autoprefixer';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import mergejson from 'gulp-merge-json';
import imagemin from 'gulp-imagemin';
import includejs from 'gulp-include';
import chalk from 'chalk';
import ansiAlign from 'ansi-align';
import connect from 'gulp-connect';
import browserSync from 'browser-sync';
import argv from 'yargs';

const reload = browserSync.create().reload;
const folder = argv.argv.folder,
      devFolder = folder + '/dev/',
      distFolder = folder + '/dist/',
      chalkGreen = chalk.bgGreen.black,
      chalkYellow = chalk.bgYellow.black;

console.log(ansiAlign(chalkGreen('\n<=========> Gulp Build Started <=========>') + '\n' + chalkYellow('--> Project name: ' + chalk.underline(folder) + ' <--\n')));

/*=========// HTML //=========*/
const html = () => {
  let dev = gulp.src(devFolder + '*.html')
    .pipe(plumber())
    // .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(distFolder));
  let dist = gulp.src(distFolder + '*.html')
    .pipe(browserSync.stream());

  return dev && dist;
}

/*=========// SASS //=========*/
const scss = () => {
  let dev = gulp.src(devFolder + 'src/scss/*.scss')
    .pipe(plumber())
    .pipe(sassglob())
    .pipe(sass())
    .pipe(autoprefixer('>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 10'))
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(distFolder + 'src/css/'));
  let dist = gulp.src(distFolder + 'src/css/*.css')
    .pipe(browserSync.stream());

  return dev && dist;
}

/*=========// JavaScript //=========*/
const javascript = () => {
  let dev = gulp.src(devFolder + 'src/js/*.js')
    .pipe(plumber())
    .pipe(includejs({
      extensions: 'js',
      hardFail: true,
      includePaths: [
        __dirname + '/' + devFolder + 'src/js'
      ]
    }))
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify({
      mangle: false,
      output: {
        comments: true
      }
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(distFolder + 'src/js/'))
  let dist = gulp.src(distFolder + 'src/js/*.js')
    .pipe(browserSync.stream());

  return dev && dist;
}

/*=========// JSON //=========*/
const json = () => {
  let dev = gulp.src(devFolder + 'src/json/**/*.json')
    .pipe(mergejson({fileName: 'merge.json'}))
    .pipe(gulp.dest(distFolder + 'src/json/'));
  let dist = gulp.src(devFolder + 'src/json/*.json')
    .pipe(browserSync.stream());

  return dev && dist;
}

/*=========// Fonts //=========*/
const fonts = () => {
  let dev = gulp.src([devFolder + 'src/fonts/*'])
    .pipe(gulp.dest(distFolder + 'src/fonts/'));

  return dev;
}

/*=========// Plugins //=========*/
const plugins = () => {
  let dev = gulp.src([devFolder + 'src/plugins/*'])
    .pipe(gulp.dest(distFolder + 'src/plugins/'));

  return dev;
}

/*=========// IMG //=========*/
const images = () => {
  let dev = gulp.src([devFolder + 'images/*'])
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 9
    }))
    .pipe(gulp.dest(distFolder + 'images/'));

  return dev;
}

/*=========// Icons //=========*/
const icons = () => {
  let dev = gulp.src([devFolder + 'images/icons/*'])
    .pipe(gulp.dest(distFolder + 'images/icons/'));

  return dev;
}


const startServer = () => {
  browserSync.init({
    server: {
      baseDir: distFolder
    },
    port: 3000
  });
}

const watchFiles = () => {
  gulp.watch([devFolder + '*.html'], gulp.parallel('html'));
  gulp.watch([devFolder + 'src/scss/*.scss', devFolder + 'src/scss/**/*.scss'], gulp.parallel('scss'));
  gulp.watch([devFolder + 'src/js/*.js', devFolder + 'src/js/**/*.js'], gulp.parallel('javascript'));
  gulp.watch([devFolder + 'src/json/*.json', devFolder + 'src/json/**/*.json'], gulp.parallel('json'));
  gulp.watch([devFolder + 'src/fonts/*'], gulp.parallel('fonts'));
  gulp.watch([devFolder + 'src/plugins/*'], gulp.parallel('plugins'));
  gulp.watch([devFolder + 'images/*', devFolder + 'images/**/*'], gulp.parallel('images'));
  gulp.watch([devFolder + 'images/icons/*'], gulp.parallel('icons'));
}

const build = gulp.parallel(startServer, watchFiles, reload);

export {
  html,
  scss,
  javascript,
  json,
  fonts,
  plugins,
  images,
  icons,
  startServer,
  watchFiles,
  build
}

exports.default = build;
