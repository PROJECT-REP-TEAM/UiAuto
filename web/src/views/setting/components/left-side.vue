<template>
  <div>
    <div>
      <span>插件路径：</span>
      <el-input
        style="width:300px"
        id="pluginsPath"
        v-model="pluginsPath"
        :disabled="false"
        @focus="openFileDialog('pluginsPath')"
        type="text"
      />
    </div>
    <div style="margin-top:15px">
      <span>项目路径：</span>
      <el-input
        style="width:300px;"
        id="projectsPath"
        v-model="projectsPath"
        :disabled="false"
        @focus="openFileDialog('projectsPath')"
        type="text"
      />
    </div>
    <div style="margin-top:15px">
      <span>服务器地址：</span>
      <el-input
        style="width:300px;"
        id="serverUrl"
        v-model="serverUrl"
        :disabled="false"
        type="text"
      />
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
        style="margin-top: 16px;"
        type="primary"
        :loading="loading"
        v-loading.fullscreen.lock="loading"
        element-loading-text="正在保存，请稍候…"
        @click="setPath()"
      >&#12288;保存&#12288;</el-button>
    </div>
  </div>
</template>

<script>
var { fileSelector } = require("@/utils/electron.js");
var path = window.require("path");
const os = window.require("os");
const fse = window.require("fs-extra");
const fs = window.require("fs");
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`;
import environment from "@/config/environment";

export default {
  data() {
    return {
      loading: false,
      url: "../../../assets/images/head.png",
      pluginsPath: environment.pluginsPath,
      projectsPath: environment.projectsPath,
      pythonPath: environment.pythonPath,
      serverUrl: environment.serverUrl,
      deviceId: environment.deviceId || ""
    };
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
            type: "error"
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
            deviceId: oldPath.deviceId || ""
          };
          if (oldPath.projectsPath !== newPath.projectsPath) {
            fse.moveSync(oldPath.projectsPath, this.projectsPath);
          }
          if (oldPath.pluginsPath !== newPath.pluginsPath) {
            fse.moveSync(oldPath.pluginsPath, this.pluginsPath);
          }
          fs.writeFileSync(configPath, JSON.stringify(newPath, null, "\t"));
          this.loading = false;
          this.$message({
            message: "修改成功",
            type: "success"
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
            type: "error"
          });
        }
      }, 1000);
    },
    openFileDialog(id) {
      var self = this;
      document.querySelector(`#${id}`).blur();
      if (id === "pythonPath") {
        fileSelector({ properties: ["openFile"] }).then(result => {
          if (Array.isArray(result) && id === "pythonPath") {
            self.pythonPath = result[0];
          }
        });
      } else {
        fileSelector({ properties: ["openDirectory"] }).then(result => {
          if (Array.isArray(result) && id === "pluginsPath") {
            self.pluginsPath = result[0];
          } else if (Array.isArray(result) && id === "projectsPath") {
            self.projectsPath = result[0];
          }
        });
      }
    }
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
    }
  }
};
</script>