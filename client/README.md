# UiAuto Electron client

## 启动项目

```bash
# Go into the repository
cd client
# Install dependencies
npm install
# Run the app
npm start
# If appear "Cannot find module '../build/Debug/pty.node'", Need to execute the command
npm install --save-dev electron-rebuild
npm run rebuild
```


<!-- "electronDownload": {
    "mirror":"https://npmmirror.com/mirrors/electron/"
}, -->


<!-- {
"from": "redist",
"to": "redist",
"filter": [
    "**/*"
]
}, -->


<!-- {
"from": "public/node_modules",
"to": "node_modules",
"filter": [
    "**/*"
]
}, -->



<!-- {
"from": "node_modules",
"to": "node_modules",
"filter": [
    "**/*",
    "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
    "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
    "!**/node_modules/*.d.ts",
    "!**/node_modules/.bin",
    "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
    "!.editorconfig",
    "!**/._*",
    "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
    "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
    "!**/{appveyor.yml,.travis.yml,circle.yml}",
    "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
]
}, -->


## 打包项目项目


```bash
# Go into the repository
cd client
# Install dependencies
npm run pack
```