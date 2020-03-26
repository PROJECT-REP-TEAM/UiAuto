<!--
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-08-19 17:01:03
 * @LastEditTime: 2019-08-20 09:18:42
 * @Description: file content
 -->
<template>
  <div>
    <el-button
      class="button"
      type="primary"
      :loading="allDownloadStatus"
      @click="download()"
    >{{allDownloadStatus === true ? '正在下载' : '全部下载'}}</el-button>
  </div>
</template>

<script>
import _ from "lodash";
var path = window.require("path");
import config from "@/config/environment/index";
import environment from "@/config/environment";
import { downloadAllPlugin } from "@/utils/downloadAllPlugin.js";

export default {
  data() {
    return {};
  },
  computed: {
    allDownloadStatus() {
      return this.$store.state.plugin.has_all_plugin_downloading;
    }
  },
  created() {},
  methods: {
    download() {
      this.$store.commit("plugin/ALL_PLUGIN_DOWNLOADING", true);
      downloadAllPlugin.$emit("getdownloadAllPlugin", true);
    }
  }
};
</script>

<style lang="scss" scoped>
.button {
  font-size: 12px;
  height: 30px !important;
  width: 71px;
  color: white;
  //   background: #4a90e2;
  //   margin-top: 10px;
  //   margin-left: 10px;
  padding: 0px !important;
}

/deep/ .el-input-group__append {
  background-color: #1890ff;
  color: #ffffff;
  border: 1px solid #1890ff;
}
</style>