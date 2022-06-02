<template>
  <div>
    <div>
      <span>插件路径：</span>
      <el-input
        id="pluginsPath"
        v-model="pluginsPath"
        style="width: 300px"
        disabled
        type="text"
      />
    </div>
    <div style="margin-top: 15px">
      <span>项目路径：</span>
      <el-input
        id="projectsPath"
        v-model="projectsPath"
        style="width: 300px"
        :disabled="false"
        type="text"
        @focus="openFileDialog('projectsPath')"
      />
    </div>
    <div style="margin-top: 15px">
      <span>服务器地址：</span>
      <el-input
        id="serverUrl"
        v-model="serverUrl"
        style="width: 300px"
        :disabled="false"
        type="text"
      />
    </div>
    <div style="margin-top: 15px">
      <span>开机启动：</span>
      <el-switch v-model="isOpenAtLogin" />
    </div>
    <!-- <div style="margin-top:15px">
      <span>Python路径：</span>
      <el-input
        style="width:300px;"
        id="pythonPath"
        v-model="pythonPath"
        :disabled="false"
        @focus="openFileDialog('pythonPath')"
        type="text"
      />
    </div>-->
    <div align="left">
      <el-button
        v-loading.fullscreen.lock="loading"
        style="margin-top: 16px"
        type="primary"
        :loading="loading"
        element-loading-text="正在保存，请稍候…"
        @click="setPath()"
        >&#12288;保存&#12288;</el-button
      >
    </div>
  </div>
</template>

<script>
var { fileSelector } = require("@/utils/electron.js");
var path = window.nodeRequire("path");
const os = window.nodeRequire("os");
const fse = window.nodeRequire("fs-extra");
const fs = window.nodeRequire("fs");
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`;
import environment from "@/config/environment";
const electron = require("@/utils/electron");
const { app } = window.nodeRequire("@electron/remote");

export default {
  data() {
    return {
      loading: false,
      url: "../../../assets/images/head.png",
      pluginsPath: environment.pluginsPath,
      projectsPath: environment.projectsPath,
      pythonPath: environment.pythonPath,
      serverUrl: environment.serverUrl,
      deviceId: environment.deviceId || "",
      isOpenAtLogin: environment.hasOwnProperty("isOpenAtLogin")
        ? environment.isOpenAtLogin
        : true,
    };
  },
  watch: {
    pluginsPath(val) {
      environment.pluginsPath = val;
    },
    projectsPath(val) {
      environment.projectsPath = val;
    },
    serverUrl(val) {
      environment.serverUrl = val;
    },
  },
  mounted() {
    // console.error(this.$store.state.pathsettings);
  },
  methods: {
    setPath() {
      this.loading = true;
      setTimeout(() => {
        var oldPath = JSON.parse(fs.readFileSync(configPath, "utf8"));
        if (this.pluginsPath === this.projectsPath) {
          this.$message({
            message: "插件路径和项目路径不可相同",
            type: "error",
          });
          this.loading = false;
          environment.projectsPath = oldPath.projectsPath;
          environment.pluginsPath = oldPath.pluginsPath;
          environment.pythonPath = oldPath.pythonPath;
          environment.serverUrl = oldPath.serverUrl;
          environment.deviceId = oldPath.deviceId || "";
          return;
        }
        try {
          var newPath = {
            pluginsPath: this.pluginsPath,
            projectsPath: this.projectsPath,
            pythonPath: this.pythonPath,
            serverUrl: this.serverUrl,
            deviceId: oldPath.deviceId || "",
          };
          if (oldPath.projectsPath !== newPath.projectsPath) {
            fse.copySync(oldPath.projectsPath, this.projectsPath);
            fse.emptyDirSync(oldPath.projectsPath);
          }
          if (oldPath.pluginsPath !== newPath.pluginsPath) {
            fse.copySync(oldPath.pluginsPath, this.pluginsPath);
            fse.emptyDirSync(oldPath.pluginsPath);
          }

          if (this.isOpenAtLogin) {
            if (os.platform() === "win32") {
              app.setLoginItemSettings({
                openAtLogin: true,
                openAsHidden: false,
                path: path.normalize(
                  path.resolve() + "/public/utils/selfStart.bat"
                ),
              });
            } else if (os.platform() === "darwin") {
              app.setLoginItemSettings({
                openAtLogin: true,
                openAsHidden: false,
              });
            }
          } else {
            app.setLoginItemSettings({
              openAtLogin: false,
              openAsHidden: false,
            });
          }
          newPath.isOpenAtLogin = this.isOpenAtLogin;
          let savaData = _.assign(oldPath, newPath);

          fs.writeFileSync(configPath, JSON.stringify(savaData, null, "\t"));
          this.loading = false;
          this.$message({
            message: "修改成功",
            type: "success",
          });
        } catch (e) {
          environment.projectsPath = oldPath.projectsPath;
          environment.pluginsPath = oldPath.pluginsPath;
          environment.pythonPath = oldPath.pythonPath;
          environment.serverUrl = oldPath.serverUrl;
          environment.deviceId = oldPath.deviceId || "";
          this.loading = false;
          this.$message({
            message: e,
            type: "error",
          });
        }
      }, 1000);
    },
    openFileDialog(id) {
      var self = this;
      document.querySelector(`#${id}`).blur();
      if (id === "pythonPath") {
        fileSelector({ properties: ["openFile"] }).then((result) => {
          if (Array.isArray(result) && id === "pythonPath") {
            result.length && (self.pythonPath = result[0]);
          }
        });
      } else {
        fileSelector({ properties: ["openDirectory"] }).then((result) => {
          if (Array.isArray(result) && id === "pluginsPath") {
            result.length && (self.pluginsPath = result[0]);
          } else if (Array.isArray(result) && id === "projectsPath") {
            result.length && (self.projectsPath = result[0]);
          }
        });
      }
    },
  },
};
</script>
