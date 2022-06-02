<template>
  <div>
    布局大小：
    <el-radio-group v-model="radio" @change="setSize">
      <el-radio-button label="小" />
      <el-radio-button label="中等" />
      <el-radio-button label="正常" />
      <el-radio-button label="大" />
    </el-radio-group>
    <!--    <p align="left" style="word-wrap: break-word;">机器码：{{device_id}}</p>-->
    <p align="left" style="margin-top: 10px">
      外壳版本：{{ electron_version }}
    </p>
    <p align="left" style="margin-top: 10px">页面版本：{{ vue_version }}</p>
    <!-- <p align="left" style="margin-top:10px">版本更新：</p> -->
    <p align="left" style="margin-top: 10px">
      UiAuto是览众全新一代RPA可视化解决方案，致力于提供一套简单方便、专业可靠、无限可能的RPA可视化最佳实践
    </p>
    <el-button-group>
      <el-button
        class="action_button"
        type="primary"
        :loading="checkDependencyLoading"
        @click="checkDependency()"
        >检查浏览器驱动</el-button
      >
      <el-button
        class="action_button"
        type="primary"
        :loading="initPythonEnvironmentLoading"
        @click="initPython()"
        >初始化python环境</el-button
      >
      <el-button class="action_button" type="primary" @click="checkUpdate()"
        >检查更新</el-button
      >
      <el-button class="action_button" type="primary" @click="developer()"
        >开发者模式</el-button
      >
    </el-button-group>
  </div>
</template>

<script>
var ipc = window.nodeRequire("electron").ipcRenderer;
var electron_version = window.nodeRequire("@electron/remote").app.getVersion();
const os = window.nodeRequire("os");
const fse = window.nodeRequire("fs-extra");
var path = window.nodeRequire("path");
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`;
const uiautoConfig = fse.readJsonSync(configPath);
const {
  checkChromeDriver,
  initPythonEnvironment
} = require("../../../client/index");
import environment from "@/config/environment";
export default {
  data() {
    return {
      checkDependencyLoading: false,
      initPythonEnvironmentLoading: false,
      device_id: uiautoConfig.deviceId,
      electron_version: electron_version,
      vue_version: environment.version,
      radio:
        this.$store.getters.size == "mini"
          ? "小"
          : this.$store.getters.size == "small"
          ? "中等"
          : this.$store.getters.size == "default"
          ? "大"
          : "正常",
    };
  },
  methods: {
    setSize(data) {
      const size =
        data == "小"
          ? "mini"
          : data == "中等"
          ? "small"
          : data == "正常"
          ? "medium"
          : "default";
      this.$ELEMENT.size = size;
      this.$store.dispatch("app/setSize", size);
      this.$store.dispatch("tagsView/delAllCachedViews", this.$route);
      const { fullPath, meta } = this.$route;
      this.$nextTick(() => {
        this.$router.replace({
          path: "/redirect" + fullPath,
          meta: meta,
        });
      });
      this.$message({
        message: "布局切换成功",
        type: "success",
      });
    },
    developer() {
      ipc.send("open-dev-tools", "");
    },
    checkDependency() {
      this.checkDependencyLoading = true;
      checkChromeDriver()
        .then((res) => {
          this.checkDependencyLoading = false;
          this.$message({
            message: "检查浏览器驱动完成",
            type: "success",
          });
        })
        .catch((err) => {
          this.checkDependencyLoading = false;
          this.$message({
            message: "检查浏览器驱动失败",
            type: "error",
          });
        });
    },
    initPython() {
      this.initPythonEnvironmentLoading = true;
      initPythonEnvironment()
        .then((res) => {
          this.initPythonEnvironmentLoading = false;
          this.$message({
            message: "初始化python环境完成",
            type: "success",
          });
        })
        .catch((err) => {
          this.initPythonEnvironmentLoading = false;
          this.$message({
            message: "初始化python环境失败",
            type: "error",
          });
        });
    },
    async checkUpdate() {
      try {
        this.$message({
          message: "检查更新成功",
          type: "success",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        this.$message({
          message: "检查更新失败",
          type: "error",
        });
      }
      // var mainWindow = BrowserWindow.getAllWindows()[0];
      // mainWindow = null;
      // app.relaunch({ args: process.argv.slice(1).concat(["--relaunch"]) });
      // app.exit(0);
    },
  },
};
</script>

<style lang="scss" scoped>
.action_button {
  margin-bottom: 10px;
  margin-right: 10px !important;
  border-color: #409eff !important;
  border-radius: 4px !important;
  border-top-left-radius: 4px !important;
  border-top-right-radius: 4px !important;
  border-bottom-right-radius: 4px !important;
  border-bottom-left-radius: 4px !important;
}
</style>
