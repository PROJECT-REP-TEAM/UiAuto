<template>
  <div>
    布局大小：
    <el-radio-group v-model="radio" @change="setSize">
      <el-radio-button label="小"></el-radio-button>
      <el-radio-button label="中等"></el-radio-button>
      <el-radio-button label="正常"></el-radio-button>
      <el-radio-button label="大"></el-radio-button>
    </el-radio-group>
    <p align="left" style="word-wrap: break-word;">机器码：{{device_id}}</p>
    <p align="left" style="margin-top: 10px">外壳版本：{{electron_version}}</p>
    <p align="left" style="margin-top: 10px">页面版本：{{vue_version}}</p>
    <!-- <p align="left" style="margin-top:10px">版本更新：</p> -->
    <p align="left" style="margin-top:10px">UiAuto是览众全新一代RPA可视化解决方案，致力于提供一套简单方便、专业可靠、无限可能的RPA可视化最佳实践</p>
    <el-button type="primary">检查更新</el-button>
    <el-button type="primary" @click="developer()">开发者模式</el-button>
  </div>
</template>

<script>
var ipc = window.require("electron").ipcRenderer;
var electron_version = window.require("electron").remote.app.getVersion();
const os = window.require("os");
const fse = window.require("fs-extra");
var path = window.require("path");
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`;
const uiautoConfig = fse.readJsonSync(configPath);
import environment from "@/config/environment";
export default {
  data() {
    return {
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
          : "正常"
    };
  },
  methods: {
    setSize(data) {
      let size =
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
          meta: meta
        });
      });
      this.$message({
        message: "布局切换成功",
        type: "success"
      });
    },
    developer() {
      ipc.send("open-dev-tools", "");
    }
  }
};
</script>
