var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var log = require('fancy-log');
var resolutions = require('browserify-resolutions');
var hash_src = require("gulp-hash-src");
var assign = require('lodash.assign');

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
  var w = watchify(b);
  w.on('update', bundle); // on any dep update, runs the bundler
  w.on('log', log); // output build logs to terminal

  var dirs = path.WATCH_DIRS.concat(['src/js/**/*.js']);
  gulp.watch(dirs, ['copy']);
});


gulp.task('build_bundle', bundle);

function bundle() {
  var now = new Date();
  log(now + ' - built bundle');

  var stream = b.bundle().on('error', function(err){
      console.log(err.message);
      this.emit('end');
    })
    .pipe(source(path.OUT))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }));

    if (process.env.NODE_ENV === 'production') {
        stream = stream.pipe(uglify());
    }

    return (
      stream
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(path.DEST_SRC))
    );
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

gulp.task('apply-prod-environment', function() {
    process.stdout.write("Setting NODE_ENV to 'production'" + "\n");
    process.env.NODE_ENV = 'production';
    if (process.env.NODE_ENV != 'production') {
        throw new Error("Failed to set NODE_ENV to production!!!!");
    } else {
        process.stdout.write("Successfully set NODE_ENV to production" + "\n");
    }
});

gulp.task('production', ['apply-prod-environment', 'build_html', 'build_bundle']);

gulp.task('default', ['build_bundle', 'watch']);