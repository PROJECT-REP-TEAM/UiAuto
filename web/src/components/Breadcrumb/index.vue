<template>
  <div
    style="
      float: right;
      width: 200px;
      line-height: 30px;
      -webkit-app-region: no-drag;
    "
  >
    <el-button size="mini" icon="el-icon-minus" @click="handleMinimize" />
    <el-button size="mini" :icon="icon" @click="handleMaximize" />
    <el-button size="mini" icon="el-icon-close" @click="handleClose" />
  </div>
</template>

<script>
const { BrowserWindow } = window.nodeRequire("@electron/remote");
const electron = require("../../utils/electron");
const { comfirmExitApp } = require("../../client/index");

export default {
  data() {
    return {
      levelList: null,
      projectName: "",
      icon: "el-icon-full-screen",
    };
  },
  methods: {
    handleMinimize() {
      electron.window_minimize();
    },
    handleMaximize() {
      let mainWindow = BrowserWindow.getAllWindows()[0];
      if (!mainWindow.isMaximized()) {
        this.icon = "el-icon-copy-document";
      } else {
        this.icon = "el-icon-full-screen";
      }
      electron.window_setContentSize();
    },
    handleClose() {
      comfirmExitApp();
    },
  },
};
</script>

<style lang="scss" scoped>
.el-button + .el-button {
  margin: 0;
}

.el-button--default {
  border: none;
  color: #fff;
  background-color: transparent;
}
.el-button--default:hover {
  color: #fff;
  background-color: transparent;
}
.el-button--default:focus {
  color: #fff;
  background-color: transparent;
}
</style>
