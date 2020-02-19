/*
gulpfile的每个插件的用法可以打开 http://www.npmjs.com  搜索 对应的插件名字，即可看到详细文档及用法
 */

/**
 * [gulp 安装依赖可直接]
 * cnpm install gulpjs/gulp#4.0 del gulp-ejs tmt-ejs-helper gulp-uglify gulp-plumber gulp-if browser-sync gulp-lazyimagecss gulp-postcss postcss-pxtorem autoprefixer gulp-posthtml gulp-sass posthtml-px2rem gulp-rev-all gulp-rev-delete-original gulp-usemin gulp-cssnano gulp-imagemin imagemin-pngquant gulp-tmtsprite gulp-filter http-proxy-middleware babel-core babel-preset-env babel-preset-es2015  -g
 */
var gulp = require('gulp'),
    path = require('path'),
    del = require('del'),
    ejs = require('gulp-ejs'),
    ejshelper = require('xfs-ejs-helper'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    gulpif = require('gulp-if'),
    bs = require('browser-sync').create(),
    lazyImageCSS = require('gulp-lazyimagecss'),
    postcss = require('gulp-postcss'),
    postcssPxtorem = require('postcss-pxtorem'),
    postcssAutoprefixer = require('autoprefixer'),
    posthtml = require('gulp-posthtml'),
    sass = require('gulp-sass'),
    posthtmlPx2rem = require('posthtml-px2rem'),
    RevAll = require('gulp-rev-all'),
    revDel = require('gulp-rev-delete-original'),
    usemin = require('gulp-usemin'),
    minifyCSS = require('gulp-cssnano'),
    filter = require('gulp-filter'),
    babel = require('gulp-babel');
    // pngquant = require('imagemin-pngquant'),
    // tmtsprite = require('gulp-tmtsprite'),
    // imagemin = require('gulp-imagemin'),
    // seajsCombo = require('gulp-seajs-combo');

var paths = {
        'src': {
            'dir': './src/',
            'img': './src/**/*.{JPG,jpg,png,gif,svg}',
            'slice': './src/**/slice/**/*.png',
            'sass': './src/**/*.scss',
            'css': './src/**/*.css',
            'js': ['./src/**/*.js','!./src/js/lib/**/*.js'],
            'media': ['./src/**/media/**/*', './src/**/fonts/**/*'],
            'html': ['./src/**/*.html', '!./src/_*/**/*.html']
        },
        'dist': {
            'dir': './dist/',
            'img': './dist/assets/img/',
            'css': './dist/',
            'js': './dist/assets/js/',
            'sprite': './dist/assets/sprite',
            'html': './dist/'
        }
    },
    config = {
        livereload: true,
        reversion: true,
        seajs: true,
        lazyDir: ['../slice'],
        supportREM:true
    },
    lazyDir = config.lazyDir || ['../slice'],

    postcssOption = [];

if (config.supportREM) {
    postcssOption = [
        postcssAutoprefixer({ browsers: ['> 0%'] }),
        postcssPxtorem({
            root_value: '37.5', // 基准值 html{ font-zise: 20px; }
            prop_white_list: [], // 对所有 px 值生效
            minPixelValue: 2 // 忽略 1px 值
        })
    ]
} else {
    postcssOption = [
        postcssAutoprefixer({ browsers: ['> 0%'] })
    ]
}

// 复制操作
var copyHandler = function(type, file) {
    file = file || paths['src'][type];

    return gulp.src(file, { base: paths.src.dir })
        .pipe(gulp.dest('./dist/'))
        .on('end', reloadHandler);
};

// 自动刷新
var reloadHandler = function() {
    config.livereload && bs.reload();
};

// 清除 dist 目录
function delDist() {
    return del([paths.dist.dir]);
}
// 复制文件操作
function copyMedia() {
    return copyHandler('media');
}
/**
 * [compileSass 编译sass及合并Sprite]
 * @return {[type]} [description]
 */
function compileSass() {
    return gulp.src(paths.src.sass)
        .pipe(plumber())
        .pipe(sass())
        .pipe(lazyImageCSS({ imagePath: lazyDir }))
        // .pipe(tmtsprite({ slicePath: '../slice', margin: 4 }))
        .pipe(gulpif('*.png', gulp.dest(paths.dist.sprite), gulp.dest(paths.dist.css)))
        .on('end', reloadHandler);
}

function compileCss() {
    return gulp.src(paths.src.css)
        .pipe(gulp.dest(paths.dist.dir))
        // .pipe(lazyImageCSS({ imagePath: lazyDir }))
        // .pipe(tmtsprite({ slicePath: '../slice', margin: 4 }))
        // .pipe(gulpif('*.png', gulp.dest(paths.dist.sprite), gulp.dest(paths.dist.css)))
        .on('end', reloadHandler);
}
/**
 * [compileAutoprefixer 自动补全]
 * @return {[type]} [description]
 */
function compileAutoprefixer(cb, file) {

    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.dir;
    return gulp.src(file || './dist/**/*.css')
        .pipe(plumber())
        .pipe(postcss(postcssOption))
        .pipe(gulp.dest(destTarget)).on('end', reloadHandler);
}
/**
 * [miniCSS CSS压缩]
 * @return {[type]} [description]
 */
function miniCSS(cb, file) {
    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.dir;
    return gulp.src(file || './dist/**/*.css')
        .pipe(plumber())
        .pipe(minifyCSS({
            safe: true,
            reduceTransforms: false,
            advanced: false,
            compatibility: 'ie7',
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);;
}

/**
 * [imageminImg 图片压缩]
 * @return {[type]} [description]
 */
function imageminImg(cb, file) {
    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.dir;
    return gulp.src(file || paths.src.img)
        // .pipe(imagemin({
        //     use: [pngquant()]
        // }))
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);;
}

/**
 * [compileJs 编译压缩JS]
 * @return {[type]} [description]
 */
function compileJs(cb, file) {
    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.dir,
        jsFilter = filter('**/page-*.js', { restore: true })
    return gulp.src(file || paths.src.js)
        // .pipe(jsFilter)
        // .pipe(seajsCombo({
        //     ignore: ['jquery', 'bootstrap', 'bootstrap.min']
        // }))
        // .pipe(jsFilter.restore)
        //.pipe(uglify({
        //    mangle: {
        //        except: ['$', 'require', 'exports', 'module']
        //    }
        // }))
        .pipe(plumber())
        .pipe(babel({
          presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);;
}



/**
 * [imageminSprite 雪碧图压缩]
 * @return {[type]} [description]
 */
function imageminSprite() {
    return gulp.src('./dist/assets/sprite/**/*')
        // .pipe(imagemin({
        //     use: [pngquant()]
        // }))
        .pipe(gulp.dest(paths.dist.sprite))
        .on('end', reloadHandler);;
}

//html 编译
function compileHtml(cb, file) {
    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.html;
    return gulp.src(file || paths.src.html)
        .pipe(ejs(ejshelper()))
        // .pipe(gulpif(
        //     config.supportREM,
        //     posthtml(
        //         posthtmlPx2rem({
        //             rootValue: 20,
        //             minPixelValue: 2
        //         })
        //     )))
        .pipe(gulp.dest(paths.dist.html))
        .pipe(usemin({
            css: [minifyCSS],
            js: [uglify],
            inlinejs: [uglify],
            inlinecss: [minifyCSS, 'concat']
        }))
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);;
}

//新文件名(md5)
function reversion(cb) {
    var revAll = new RevAll({
        fileNameManifest: 'manifest.json',
        dontRenameFile: ['.html', '.jsp'],
        dontUpdateReference:['.html'],
        transformFilename: function(file, hash) {
            var filename = path.basename(file.path);
            var ext = path.extname(file.path);

            if (/^\d+\..*\.js$/.test(filename)) {
                return filename;
            } else {
                return path.basename(file.path, ext) + '.' + hash.substr(0, 8) + ext;
            }

        }
    });
    if (config['reversion']) {
        return gulp.src(['./dist/**/*', '!gulpfile.js'])
            .pipe(revAll.revision())
            .pipe(gulp.dest(paths.dist.dir))
            .pipe(revDel({
                exclude: /(.html|.htm)$/
            }))
            .pipe(revAll.manifestFile())
            .pipe(gulp.dest(paths.dist.dir));
    } else {
        cb();
    }

}

//启动 livereload
function startServer(cb) {
    bs.init({
        server: './dist',
        port: config['livereload']['port'] || 8089,
        // startPath: config['livereload']['startPath'] || '/',
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
    cb();
}


var watchHandler = function(type, file) {
    var target = path.extname(file),
        destTarget = path.dirname(file).replace('src', 'dist');
    switch (target) {
        case '.jpg':
        case '.png':
        case '.gif':
        case '.bmp':
            if (type === 'removed') {
                var tmp = file.replace('src', 'dist');
                del([tmp]);
            } else {
                imageminImg(null, file);
            }
            break;

        case '.js':
            if (type === 'removed') {
                var tmp = file.replace('src', 'dist');
                del([tmp]);
            } else {
                // compileJs();
                compileJs(null, file);
            }
            break;

        case '.mp3':
        case '.swf':
        case '.ttf':
        case '.woff':
        case '.svg':
        case '.woff2':
            if (type === 'removed') {
                var tmp = file.replace('src', 'dist');
                del([tmp]);
            } else {
                copyHandler('media', file);
            }
            break;

        case '.css':

            if (type === 'removed') {
                var tmp = file.replace('src', 'dist').replace(target, '.css');
                del([tmp]);
            } else {
                // compileCss();
                // reloadHandler();
                return gulp.src(file)
                    .pipe(plumber())
                    .pipe(postcss(postcssOption))
                    .pipe(minifyCSS({
                        safe: true,
                        reduceTransforms: false,
                        advanced: false,
                        compatibility: 'ie7',
                        keepSpecialComments: 0
                    }))
                    .pipe(gulp.dest(destTarget))
                    .on('end', reloadHandler);
            }

            break;
        case '.scss':
            if (type === 'removed') {
                var tmp = file.replace('src', 'dist').replace(target, '.css');
                del([tmp]);
            } else {
                return gulp.src(file)
                    .pipe(plumber())
                    .pipe(sass())
                    .pipe(lazyImageCSS({ imagePath: lazyDir }))
                    // .pipe(tmtsprite({ slicePath: '../slice', margin: 4 }))
                    .pipe(gulpif('*.png', gulp.dest(paths.dist.sprite), gulp.dest(destTarget)))
                    .pipe(postcss(postcssOption))
                    .pipe(minifyCSS({
                        safe: true,
                        reduceTransforms: false,
                        advanced: false,
                        compatibility: 'ie7',
                        keepSpecialComments: 0
                    }))

                .pipe(gulp.dest(destTarget))
                    .on('end', reloadHandler);
                // compileSass();
                // reloadHandler();

            }

            break;
        case '.html':
            if (type === 'removed') {
                del([file])
            } else {
                compileHtml(null, file);
            }
            break;
    }

};

//监听文件
function watch(cb) {
    var watcher = gulp.watch([
        paths.src.img,
        paths.src.slice,
        paths.src.js,
        paths.src.media,
        paths.src.sass,
        paths.src.css,
        paths.src.html
    ], { ignored: /[\/\\]\./ });

    watcher
        .on('change', function(file) {
            console.log(file + ' has been changed');
            watchHandler('changed', file);
        })
        .on('add', function(file) {
            console.log(file + ' has been added');
            watchHandler('add', file);
        })
        .on('unlink', function(file) {
            console.log(file + ' is deleted');
            watchHandler('removed', file);
        });

    cb();
}


gulp.task('default', gulp.series(
    delDist,
    gulp.parallel(
        compileSass,
        compileCss,
        imageminImg,
        copyMedia,
        compileJs
    ),
    compileAutoprefixer,
    imageminSprite,
    miniCSS,
    compileHtml,
    watch,
    startServer
));
// dist任务主要用于一次编译发布的，不可用于开发;
// gulp.task('dist', gulp.series(
//     delDist,
//     gulp.parallel(
//         compileSass,
//         compileCss,
//         imageminImg,
//         copyMedia,
//         compileJs
//     ),
//     compileAutoprefixer,
//     imageminSprite,
//     miniCSS,
//     compileHtml,
//     reversion,
//     watch,
//     startServer
// ));

gulp.task('delDist', gulp.series(delDist));
