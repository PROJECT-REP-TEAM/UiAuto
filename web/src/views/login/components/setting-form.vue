<template>
  <div class="setting">
    <el-dialog :title="'服务器信息'" :visible.sync="dialogFormVisible" width="500px" @closed="reset">
      <el-form v-if="dialogFormVisible" ref="setting-form" label-width="100px" status-icon>
        <el-form-item label="服务器地址">
          <el-input
            id="serverUrl"
            v-model="serverUrl"
            :disabled="false"
            type="text"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm" style="background: #2249a8;">确 定</el-button>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
var { fileSelector } = require("@/utils/electron.js");
import environment from "@/config/environment";
const path = window.require("path");
const os = window.require("os");
const fse = window.require("fs-extra");
const fs = window.require("fs");
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`;

export default {
  data() {
    return {
      dialogFormVisible: false,
      serverUrl: ""
    };
  },
  watch: {
    serverUrl(val) {
      environment.serverUrl = val;
    }
  },
  methods: {
    show(user) {
      this.dialogFormVisible = true;
      this.serverUrl = environment.serverUrl;
    },
    reset() {},
    handleConfirm() {
      var oldPath = JSON.parse(fs.readFileSync(configPath, "utf8"));
      var newPath = {
        pluginsPath: oldPath.pluginsPath,
        projectsPath: oldPath.projectsPath,
        pythonPath: oldPath.pythonPath,
        serverUrl: this.serverUrl,
        deviceId: oldPath.deviceId || ""
      };
      fs.writeFileSync(configPath, JSON.stringify(newPath, null, "\t"));
      this.$message({
        message: "修改成功",
        type: "success"
      });
      this.dialogFormVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/.el-form-item__label {
  line-height: 47px !important;
}
</style>
