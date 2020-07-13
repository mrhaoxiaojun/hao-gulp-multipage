/*
gulpfile的每个插件的用法可以打开 http://www.npmjs.com  搜索 对应的插件名字，即可看到详细文档及用法
 */


// npm install gulp path del gulp-plumber browser-sync http-proxy-middleware gulp-imagemin gulp-babel@7 gulp-uglify  babel-core babel-preset-env babel-preset-es2015 --save-dev

// 不太好装 imagemin-pngquant

var gulp = require('gulp'),
  path = require('path'),
  del = require('del'),
  plumber = require('gulp-plumber'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  bs = require('browser-sync').create()
  // proxyMiddleware = require('http-proxy-middleware'),
  // imagemin = require('gulp-imagemin'),
  // pngquant = require('imagemin-pngquant')

var paths = {
  'src': {
    'img': './logdisplay/images/*.{JPG,jpg,png,gif,svg}',
    'src': './logdisplay/src/**/*.js',
    'rflib':'./logdisplay/rflib/**/*.js',
    'all': ['./logdisplay/**/*', '!./logdisplay/images/**/*.{JPG,jpg,png,gif,svg}','!./logdisplay/src/**/*.js','!./logdisplay/rflib/**/*.js'],
  },
  "dist":{
    'img': './dist/images/',
    'src':'./dist/src/',
    'rflib':'./dist/rflib/',
    'dist': './dist/'
  }
},

  /**
  proxy配置，target为需要代理的域名接口地址;可以配置多条规则;
  请求本地站点的/cooperation/* 将自动转发到http://192.168.2.187:70/cooperation/*
  可以用数组设置多个转发规则
   [proxyMiddleware(['/cooperation'], {target: 'http://192.168.2.187:70', changeOrigin: true}),
      proxyMiddleware(['/hr'], {target: 'http://192.168.2.187:70', changeOrigin: true})
   ]
   */
  proxy = [],
  config = {
    livereload: true,
    reversion: true,
    seajs: true,
    supportREM: false,
  },
  serverConfig = {
    baseDir: paths.dist.dist,
    middleware: proxy
  }


// 复制操作
function copyHandler() {
  return gulp.src(paths.src.all)
    .pipe(gulp.dest(paths.dist.dist))
    .on('end', reloadHandler);
};

// 自动刷新
var reloadHandler = function () {
  config.livereload && bs.reload();
};

// 清除 dist 目录
function delDist() {
  return del([paths.dist.dist]);
}
/**
 * [imageminImg 图片压缩]
 * @return {[type]} [description]
 */
function imageminImg() {
  return gulp.src(paths.src.img)
      // .pipe(imagemin({
      //   progressive: true,
      //   use: [pngquant()]
      // }))
      .pipe(gulp.dest(paths.dist.img))
      .on('end', reloadHandler);
}
/**
 * [compileJs 编译压缩JS]
 * 
 *  @return {[type]} [description]
 */
function srcJs (){
  return  gulp.src(paths.src.src)
  // .pipe(jsFilter)
  // .pipe(seajsCombo({
  //     ignore: ['jquery', 'bootstrap', 'bootstrap.min']
  // }))
  // .pipe(jsFilter.restore)
  // .pipe(uglify({
  //    mangle: {
  //        except: ['$', 'require', 'exports', 'module']
  //    }
  // }))
  .pipe(plumber())
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(uglify())
  .pipe(gulp.dest(paths.dist.src))
  .on('end', reloadHandler);
}
/**
 * [compileJs 编译压缩JS]
 * 
 *  @return {[type]} [description]
 */
function rflibJs (){
  return  gulp.src(paths.src.rflib)
  // .pipe(jsFilter)
  // .pipe(seajsCombo({
  //     ignore: ['jquery', 'bootstrap', 'bootstrap.min']
  // }))
  // .pipe(jsFilter.restore)
  // .pipe(uglify({
  //    mangle: {
  //        except: ['$', 'require', 'exports', 'module']
  //    }
  // }))
  .pipe(plumber())
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(uglify())
  .pipe(gulp.dest(paths.dist.rflib))
  .on('end', reloadHandler);
}

//启动 livereload
function startServer(cb) {
  bs.init({
    server: serverConfig,
    port: config['livereload']['port'] || 8080,
    reloadDelay: 0,
    directory: true,
    notify: { //自定制livereload 提醒条
      styles: [
        "margin: 0",
        "padding: 5px",
        "position: fixed",
        "font-size: 10px",
        "z-index: 9999",
        "bottom: 0px",
        "right: 0px",
        "border-radius: 0",
        "border-top-left-radius: 5px",
        "background-color: rgba(60,197,31,0.5)",
        "color: white",
        "text-align: center"
      ]
    }
  });
  cb()
}


var watchHandler = function (type, file) {
  var target = path.extname(file)
  switch (target) {
    case '.jpg':
    case '.png':
    case '.gif':
    case '.bmp':
      if (type === 'removed') {
        var tmp = file.replace('src', 'dist');
        del([tmp]);
      } else {
        imageminImg();
      }
      break;
    default:
      srcJs()
      rflibJs()
      copyHandler()
  }
};

//监听文件
function watch(cb) {
  var watcher = gulp.watch([
    './logdisplay/**/*',
  ], { ignored: /[\/\\]\./, usePolling: true });
  watcher
    .on('change', function (file) {
      console.log(file + ' has been changed');
      watchHandler('changed', file);
    })
    .on('add', function (file) {
      console.log(file + ' has been added');
      watchHandler('add', file);
    });
    cb()
}

gulp.task('default', gulp.series(
  delDist,
  gulp.parallel(
    copyHandler,
    imageminImg,
    srcJs,
    rflibJs
  ),
  watch,
  startServer
));

gulp.task('delDist', gulp.series(delDist));