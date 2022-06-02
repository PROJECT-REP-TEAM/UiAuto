<template>
  <div>
    <el-dialog
      title="新建分类"
      :visible.sync="showDialog_create_folder"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form label-position="left" label-width="100px" @submit.native.prevent>
        <el-form-item label="分类名称">
          <el-input
            v-model.trim="folderName"
            max="100"
            placeholder="请输入分类名称"
            @keyup.enter.native="commitCreateFolder()"
          />
        </el-form-item>
      </el-form>
      <div style="margin-top: 20px; text-align: center">
        <el-button
          type="primary"
          style="width: 70px; height: 32px; line-height: 7px"
          @click="commitCreateFolder()"
          >确定</el-button
        >
        <el-button
          style="
            width: 70px;
            height: 32px;
            line-height: 7px;
            color: #1890ff;
            border: 1px solid #1890ff;
          "
          @click="handleReset()"
          >取消</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
const fs = window.nodeRequire("fs");
const fse = window.nodeRequire("fs-extra");
import _ from "lodash";
import moment from "moment";
import config from "@/config/environment/index";
import { uuid } from "vue-uuid";

export default {
  name: "Folder",
  components: {},
  data() {
    return {
      showDialog_create_folder: false,
      folderName: "",
      dropData: "",
    };
  },
  computed: {},
  mounted() {},
  methods: {
    // 创建项目文件夹
    createFolder() {
      this.showDialog_create_folder = true;
    },
    // 创建项目文件夹 - 确定
    commitCreateFolder() {
      this.folderName = this.folderName.replace(/\//g, "").replace(/\\/g, "");
      if (!this.folderName.trim()) {
        return this.$message.warning("分类名称不能为空");
      }
      if (!config.projectsPath) {
        return this.$message.warning("请先到系统管理设置项目路径");
      }
      if (fs.existsSync(`${config.projectsPath}/${this.folderName}`)) {
        this.$message.warning("已存在同名分类");
      } else {
        if (!fs.existsSync(`${config.projectsPath}/${this.folderName}`)) {
          fse.ensureDirSync(`${config.projectsPath}/${this.folderName}`);
          let writeJson = _.extend(
            { uuid: uuid.v1() },
            { folder_name: this.folderName },
            { project_type: "folder" },
            { projects: [] },
            { projects_name: [] },
            { createAt: moment().format("YYYY-MM-DD HH:mm:ss") },
            { updateAt: moment().format("YYYY-MM-DD HH:mm:ss") }
          );
          fs.writeFileSync(
            `${config.projectsPath}/${this.folderName}/${this.folderName}.json`,
            JSON.stringify(writeJson, null, "\t"),
            "utf8"
          );

          this.$parent.getProjectList();
        }
        this.handleReset();
      }
    },
    // 创建项目文件夹 - 取消
    handleReset() {
      this.folderName = "";
      this.showDialog_create_folder = false;
    },
  },
};
</script>

<style scoped>
.el-button + .el-button {
  margin: 0;
}
</style>
