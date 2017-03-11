var gulp = require('gulp');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var streamify = require('gulp-streamify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var resolutions = require('browserify-resolutions');
var hash_src = require("gulp-hash-src");
var assign = require('lodash.assign');
var shell = require('gulp-shell');

var path = {
  HTML: ['src/{*.html,*.xml}'],
  HTML_INDEX: 'src/index.html',
  OUT: 'build.js',
  DEST: 'dist',
  BROWSERIFY_PATHS: ['./src/js','./node_modules'],
  DEST_SRC: 'dist/src',
  ENTRY_POINT: './src/js/main.js'
};

path.WATCH_DIRS = path.HTML

var BROWSERIFY_OPTS = {
  entries: [path.ENTRY_POINT],
  debug: true,
  paths: path.BROWSERIFY_PATHS,
  cache: {},
  packageCache: {},
  fullPaths: true
};

gulp.task('copy', function(){
  gulp.src(path.HTML, {base: 'src/'})
    .pipe(gulp.dest(path.DEST));
});

var bopts = assign({}, watchify.args, BROWSERIFY_OPTS);
var b = browserify(bopts)
  .plugin(resolutions, 'react')
  .transform(babelify.configure({
    optional: ["es7.decorators","es7.asyncFunctions","es7.classProperties"],
    experimental: true
  })
);

gulp.task('watch', function() {
  w = watchify(b);
  w.on('update', bundle); // on any dep update, runs the bundler
  w.on('log', gutil.log); // output build logs to terminal

  var dirs = path.WATCH_DIRS.concat(['src/js/**/*.js']);
  gulp.watch(dirs, ['copy']);
});


gulp.task('build_bundle', bundle);

function bundle() {
  var now = new Date();
  gutil.log(now + ' - built bundle');

  return b.bundle().on('error', function(err){
      console.log(err.message);
      this.emit('end');
    })
    .pipe(source(path.OUT))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(path.DEST_SRC));
}

gulp.task('build_html', function(){
  gulp.src(path.HTML_INDEX)
    .pipe(hash_src(
      {build_dir: "./",
      src_path: "./dist/src/",
      verbose: true,
      hash_len: 6,
      regex: /(<\s*(?:script|link).*?(?:src|href)\s*=\s*(?:"|'))((?!.*\?nc).*?)((?:"|')\s*(?:>\s*<\/\s*(?:script|link)\s*>|\s*\/*>))/ig,
      analyze: function(match){
        return {
                prefix: match[1],
                link:   match[2],
                suffix: match[3]
              };
      }
    }))
    .pipe(gulp.dest(path.DEST));
});


gulp.task('production', ['build_html', 'build_bundle']);

gulp.task('default', ['build_bundle', 'watch']);