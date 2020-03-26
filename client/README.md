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


## 打包项目项目


```bash
# Go into the repository
cd client
# Install dependencies
npm run pack
```