
## Getting started

```bash
# clone the project

# enter the project directory
cd web

# install dependency
npm install

# develop
npm run dev
```

This will automatically open http://localhost:9527

## Build

```bash
# build for test environment
npm run build:stage

# build for production environment
npm run build:prod
```

## Advanced

```bash
# preview the release environment effect
npm run preview

# preview the release environment effect + static resource analysis
npm run preview -- --report

# code format check
npm run lint

# code format check and auto fix
npm run lint -- --fix
```
## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions

项目的目录结构
UIAUTO
├ client ----- electron外壳
├ web ----- web目录
│   ├ build ----- 存放打包后html、css、js等文件(构建相关)
│   ├ mock ----- 模拟接口文件
│   ├ public ----- 插件文件
│   ├ src ----- src目录
│   │   ├ api ----- 存放模拟接口文件
│   │   ├ assets ----- 静态文件，存放图片等
│   │   ├ components ----- 存放小组件(面包屑等)
│   │   ├ icons ----- 存放svg文件
│   │   ├ layout ----- 存放导航栏、设置等组件
│   │   ├ router ----- 路由文件
│   │   ├ store ----- vuex store文件
│   │   ├ styles ----- 框架样式文件
│   │   ├ util ----- 公用文件
│   │   ├ view ----- 模块文件
│   │   │   ├ dependency ----- 环境依赖模块
│   │   │   ├ home ----- 首页模块
│   │   │   ├ login ----- 登录模块
│   │   │   ├ plugin ----- 插件库模块
│   │   │   ├ project ----- 项目模块
│   │   │   ├ setting ----- 设置模块
│   │   └   └ workspace ----- 项目库模块
│   ├ App.vue ----- 入口文件
│   ├ main.js ----- 入口js依赖文件
│   ├ permission.js ----- 权限文件
└   └ setting.js ----- 设置文件