<template>
  <div class="setting">
    <el-dialog
      title="服务器信息"
      :visible.sync="dialogFormVisible"
      width="500px"
      @closed="reset"
    >
      <el-form
        v-if="dialogFormVisible"
        ref="setting-form"
        label-width="100px"
        status-icon
      >
        <el-form-item label="服务器地址">
          <el-input
            id="serverUrl"
            v-model="serverUrl"
            :disabled="false"
            type="text"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
var { fileSelector } = require("@/utils/electron.js");
import environment from "@/config/environment";
const path = window.nodeRequire("path");
const os = window.nodeRequire("os");
const fse = window.nodeRequire("fs-extra");
const fs = window.nodeRequire("fs");
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`;

export default {
  data() {
    return {
      dialogFormVisible: false,
      serverUrl: "",
    };
  },
  watch: {
    serverUrl(val) {
      environment.serverUrl = val;
    },
  },
  methods: {
    show(user) {
      this.dialogFormVisible = true;
      this.serverUrl = environment.serverUrl;
    },
    reset() {},
    handleConfirm() {
      let oldPath = JSON.parse(fs.readFileSync(configPath, "utf8"));
      let newPath = _.cloneDeep(oldPath);
      newPath.serverUrl = this.serverUrl;
      fs.writeFileSync(configPath, JSON.stringify(newPath, null, "\t"));
      this.$message({
        message: "修改成功",
        type: "success",
      });
      this.dialogFormVisible = false;
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep .el-form-item__label {
  line-height: 47px !important;
}
::v-deep .el-form-item__content {
  border: 1px solid #eee;
}
::v-deep .el-input__inner {
  color: #000 !important;
  caret-color: #000 !important;
  &:-webkit-autofill {
    box-shadow: 0 0 0px 1000px #283443 inset !important;
    -webkit-text-fill-color: #000 !important;
  }
}
</style>
