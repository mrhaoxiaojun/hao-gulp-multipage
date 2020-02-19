### 安装开发依赖

前提条件：如果高版本node不支持gulpjs/gulp#4.0，如果需要，请安装nvm管理node版本安装一个6.11.0的node版本再去安装使用

可以-g安装到全局，也可以不加-g安装到本地，但如果本地有很多项目文件需要用到，建议安装到全局，或者所有同类项目的父级元素中，这样，必须要每个项目都去安装一遍依赖包,也可再当前目录，npm isntall 下载依赖

以下是具体对以下包
```
npm install gulpjs/gulp#4.0 del gulp-ejs xfs-ejs-helper gulp-uglify gulp-plumber gulp-if browser-sync gulp-lazyimagecss gulp-postcss postcss-pxtorem autoprefixer gulp-posthtml@1.5.2 gulp-sass posthtml-px2rem gulp-rev-all gulp-rev-delete-original gulp-usemin gulp-cssnano gulp-imagemin imagemin-pngquant gulp-tmtsprite gulp-filter http-proxy-middleware babel-core babel-preset-env babel-preset-es2015  -g
```

### 启动服务

```
gulp//在启动项目打开命令后执行此命令
```



### 目录结构规范

```javascript
├─────finance 
|		 ├──src //原文件开发目录，不做为发布，开发使用
|        	├──assets  //静态资源目录
|               ├── css //css文件夹
|               |   └── i //样式调用的图片文件夹
|               |   └── bootstrap //bootstrap框架样式
|               |   └── fonts //iconfont图标字体
|               ├── js //js文件夹
|               |   └── lib //一些库（不做babel编译）
|               |   └── plugins //一些插件（不做babel编译）
|               ├── img //数据图片文件夹 
|        ├──*.html  //html文件
|        ├──node_modules  //node依赖工具包  不纳入git管理，不发布此文件夹
|        ├──package.json  //node依赖声明    不纳入git管理，不发布此文件
|        ├──gulpfile.js  //编译脚本配置	      不纳入git管理，不发布此文件
|        ├──dist //打包后生成的发布文件
```

- 目录说明
  - finance/ 为当前项目

  - finance/assets/src/ 为静态资源开发目录，里面的静态资源都是源代码  

    > 此文件夹内容纳入git管理，但上线时不发布此文件夹

  - finance/assets/css 为静态文件CSS目录

  - finance/assets/css/i 为静态文件CSS引用图片目录

  - finance/assets/js 为静态文件js目录

  - finance/assets/img 为页面html调用的数据图片目录

  - finance/node_modules 为前端工具依赖文件包

    > 此文件夹内容不纳入git管理

  - finance/gulpfile.js 为前端工具声明文件

### 开发注意事项

> pc端demo和h5端demo已经给出了，对应的例子，直接拿走，既可以使用
>
> 脚手架，为gulp，需要全局安装gulp gulp#4.0版本，并且安装相对应的开发依赖
>
> h5端的head部分已经写好了头部
>
> h5端开发过程中，不需要考虑单位转换问题，直接度量设计px单位即可，脚手架已做了rem转换
>
> 如需代理服务，修改gulpfile.js 中的proxy配置项即可
>
> 项目是有watch任务的，实时监控更新的，添加修改和删除不需要重新执行gulp命令
>
> 支持es6语法，但是请将第三方库和插件放在lib和plugins下，以防止进行babel编译，有时候会报错


### 使用目的

为解决快速开发pc和h5单页开发，解决，代码的合并、压缩、语法检查、图片压缩、css预处理（sass应用）、实时更新检查、服务、代理、postcss-pxtorem转换等