<!--
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-07-22 15:02:04
 * @LastEditTime: 2019-08-17 19:02:51
 * @Description: file content
 -->
<template>
  <div>
    <el-button class="button" type="primary" @click="handleCompressionPlugin">压缩插件</el-button>
    <el-button class="button" type="primary" @click="dialogSelectVisible = true">导入插件</el-button>
    <el-dialog title="导入插件" :visible.sync="dialogSelectVisible" width="30%" center @close="close">
      <el-dialog
        width="25%"
        top="25vh"
        :visible.sync="uploadLoading"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        append-to-body
        center
      >
        <span slot="title" class="dialog-title">{{uploadTitle}}</span>
        <div class="loading">
          <i class="el-icon-loading uploadLoading" />
        </div>
      </el-dialog>
      <el-input v-model="filePath" autocomplete="off" :readonly="true">
        <template slot="append">
          <el-upload
            class="upload-demo"
            ref="upload"
            :action="productionUploadUrl"
            :headers="headers"
            :data="uploadData"
            :on-change="fileChange"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :before-upload="beforeupload"
            :show-file-list="false"
            :auto-upload="false"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
        </template>
      </el-input>
      <center>
        <el-checkbox class="checkbox" v-model="checked">是否上传为私有插件</el-checkbox>
      </center>
      <div slot="footer" class="dialog-footer">
        <el-button
          style="color: #1890ff;border:1px solid #1890ff;"
          @click="dialogSelectVisible = false"
        >取 消</el-button>
        <el-button
          type="primary"
          style="color: white;"
          :disabled="filePath === ''"
          @click="upload()"
        >导 入</el-button>
      </div>
    </el-dialog>
    <compressionPlugin ref="compressionPlugin" />
  </div>
</template>

<script>
import _ from "lodash";
var ipc = window.require("electron").ipcRenderer;
var app = window.require("electron").remote.app;
var fse = window.require("fs-extra");
var fs = window.require("fs");
var crypto = window.require("crypto");
var decompress = window.require("decompress");
var path = window.require("path");
// var { fileSelector } = require("@/utils/electron.js");
var { nodeInit, pythonInit } = require("@/utils/init.js");
import { uploadPlugin } from "@/api/plugin";
import config from "@/config/environment/index";
import environment from "@/config/environment";
import compressionPlugin from "./compressionPlugin";

export default {
  components: { compressionPlugin },
  data() {
    return {
      // productionUploadUrl: "http://localhost:4399/api/v1/plugins/upload",
      productionUploadUrl: environment.serverUrl + "/api/v1/plugins/upload",
      dialogSelectVisible: false,
      uploadLoading: false,
      filePath: "",
      headers: null,
      uploadData: null,
      checked: false,
      uploadTitle: ""
    };
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    handleCompressionPlugin() {
      this.$refs["compressionPlugin"] && this.$refs["compressionPlugin"].show();
    },
    close() {
      this.filePath = "";
      this.checked = false;
      this.headers = null;
      this.uploadData = null;
    },
    // showDialog() {
    // console.log("showDialog");
    // const filters_extensions = ["txt", "rar"];
    // fileSelector({
    //   filters_extensions: filters_extensions
    // }).then(result => {
    //   if (Array.isArray(result)) {
    //     this.filePath = result[0];
    //   }
    // });
    // },
    fileChange(file, fileList) {
      this.filePath = file.raw.path;
      console.log(this.filePath);
      const fileContent = fs.readFileSync(this.filePath);
      const hashId = crypto
        .createHash("md5")
        .update(fileContent)
        .digest("hex");
      console.log(hashId);
      this.headers = {
        // "Content-MD5": hashId,
        Authorization: localStorage.getItem("access_token")
      };
      this.uploadData = { private: this.checked, md5: hashId };
      console.log(this.uploadData);
    },
    beforeupload(file) {
      console.log("beforeupload");
      console.log(file.path);
      this.uploadTitle = "正在上传";
      this.uploadLoading = true;
    },
    upload() {
      this.$refs.upload.submit();
    },
    uploadSuccess(response, file) {
      console.log(file);
      this.uploadTitle = "正在安装";
      this.installPlugin();
    },
    uploadError(err, file) {
      this.uploadLoading = false;
      this.dialogSelectVisible = false;
      this.uploadTitle = "";
      this.$message({
        showClose: true,
        message: "上传失败",
        type: "error"
      });
      // ipc.send("open-error-dialog", "上传失败");
    },
    installPlugin() {
      var pluginTempPath = path.normalize(
        config.pluginsPath + "/.." + "/plugins_temp/"
      );
      var pluginsPath = config.pluginsPath + "/";
      // var pluginTempPath = path.normalize(
      //   path.resolve() + "/.." + "/web/public/plugins_temp/"
      // );
      // var pluginsPath = path.normalize(
      //   path.resolve() + "/.." + "/web/public/plugins/"
      // );
      if (!fs.existsSync(pluginTempPath)) {
        fs.mkdirSync(pluginTempPath);
      }
      if (!fs.existsSync(pluginsPath)) {
        fs.mkdirSync(pluginsPath);
      }
      decompress(this.filePath, pluginTempPath, {
        filter: function(file) {
          var r = true;
          if (file.path.startsWith("__MACOSX")) {
            r = false;
          }
          return r;
        }
      })
        .then(files => {
          var folderName = files[0].path.split("/")[0];
          var folderPath = pluginTempPath + folderName;
          var packagePath = path.normalize(folderPath + "/" + "package.json");
          if (
            !fs.existsSync(folderPath) ||
            !fs.existsSync(packagePath) ||
            fse.readJsonSync(packagePath).id !== folderName ||
            !fse.readJsonSync(packagePath).version ||
            !fse.readJsonSync(packagePath).author ||
            !fse.readJsonSync(packagePath).language
          ) {
            // fse.emptyDirSync(folderPath);
            // fs.rmdirSync(folderPath);
            // ipc.send(
            //   "open-error-dialog",
            //   "包内文件不合法，请检查包内容后再试！"
            // );
            this.importError(
              "包内文件不合法，请检查包内容后再试！",
              folderPath
            );
          } else {
            try {
              var package_json = fse.readJsonSync(packagePath);
              package_json.source = "local";
              fse.writeJsonSync(packagePath, package_json);
              if (fs.existsSync(pluginsPath + folderName)) {
                fse.emptyDirSync(pluginsPath + folderName);
                fs.rmdirSync(pluginsPath + folderName);
              }
              fse.moveSync(folderPath, pluginsPath + folderName, {
                overwrite: true
              });
              if (
                fs.existsSync(
                  path.normalize(pluginsPath + folderName + "/node_modules")
                )
              ) {
                this.importSuccess();
              } else {
                if (package_json.language === "nodejs") {
                  nodeInit(pluginsPath + folderName)
                    .then(returnVaule => {
                      this.importSuccess();
                    })
                    .catch(err => {
                      this.importError(err, pluginsPath + folderName);
                    });
                } else if (package_json.language === "python") {
                  pythonInit(pluginsPath + folderName)
                    .then(returnVaule => {
                      this.importSuccess();
                    })
                    .catch(err => {
                      this.importError(err, pluginsPath + folderName);
                    });
                } else {
                  var err = "文件格式有误，language需为一种有效语言";
                  this.importError(err, pluginsPath + folderName);
                }
              }
            } catch (err) {
              this.importError(err, pluginsPath + folderName);
            }
            fse.emptyDirSync(folderPath);
            fs.rmdirSync(folderPath);
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "文件解压失败",
            type: "error"
          });
          // this.importError('文件解压失败', pluginsPath + folderName);
        });
    },
    importSuccess() {
      this.uploadLoading = false;
      this.dialogSelectVisible = false;
      this.uploadTitle = "";
      this.$message({
        showClose: true,
        message: "导入成功！",
        type: "success"
      });
      this.$store.dispatch("plugin/refreshPugin");
    },
    importError(err, path) {
      this.uploadLoading = false;
      this.dialogSelectVisible = false;
      this.uploadTitle = "";
      if (path) {
        fse.emptyDirSync(path);
        fs.rmdirSync(path);
      }
      this.$message({
        showClose: true,
        message: err,
        type: "error"
      });
      // ipc.send("open-error-dialog", err);
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

.uploadLoading {
  font-size: 35px;
  color: #409eff;
}

.loading {
  text-align: center !important;
}

/deep/ .el-input-group__append {
  background-color: #1890ff;
  color: #ffffff;
  border: 1px solid #1890ff;
}
</style>

