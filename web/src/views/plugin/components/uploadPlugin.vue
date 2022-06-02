<!--
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-07-22 15:02:04
 * @LastEditTime: 2019-08-17 19:02:51
 * @Description: file content
 -->
<template>
  <div>
    <el-dialog
      title="导入插件"
      :visible.sync="dialogSelectVisible"
      width="30%"
      center
      @close="close"
    >
      <el-form label-position="top" label-width="80px">
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="插件路径" prop="name">
              <el-input
                id="filePath_input"
                v-model="filePath"
                :disabled="true"
                type="text"
                placeholder="请选择插件路径"
                style="width: 80%"
              />
              <el-button type="primary" @click="openFileDialog()">
                <i class="el-icon-folder-opened" />
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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
        <span slot="title" class="dialog-title">{{ uploadTitle }}</span>
        <div class="loading">
          <i class="el-icon-loading uploadLoading" />
        </div>
      </el-dialog>
      <!-- <el-input v-model="filePath" autocomplete="off" :readonly="true">
        <template slot="append">
          <el-upload
            ref="upload"
            class="upload-demo"
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
      </el-input> -->
      <!-- <center>
        <el-checkbox
          class="checkbox"
          v-model="checked"
          @change="privateChange()"
          >是否上传为私有插件</el-checkbox
        >
      </center> -->
      <div slot="footer" class="dialog-footer">
        <el-button
          style="color: #1890ff; border: 1px solid #1890ff"
          @click="dialogSelectVisible = false"
          >取 消</el-button
        >
        <el-button
          type="primary"
          style="color: white"
          :disabled="filePath === ''"
          @click="upload()"
          >导 入</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
const async = require("async");
const fse = window.nodeRequire("fs-extra");
const fs = window.nodeRequire("fs");
const decompress = window.nodeRequire("decompress");
const path = window.nodeRequire("path");
var { nodeInit, pythonInit } = require("@/utils/init.js");
import config from "@/config/environment/index";
const { fileSelector } = require("@/utils/electron.js");
// import environment from "@/config/environment";

export default {
  components: {},
  data() {
    return {
      // productionUploadUrl: environment.serverUrl + "/uiauto/plugin/importZip",
      dialogSelectVisible: false,
      uploadLoading: false,
      filePath: "",
      // headers: null,
      // uploadData: null,
      // checked: false,
      uploadTitle: "",
      notifyPromise: Promise.resolve(),
    };
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    show() {
      this.dialogSelectVisible = true;
    },
    close() {
      this.filePath = "";
      // this.checked = false;
      this.headers = null;
      // this.uploadData = null;
    },
    openFileDialog() {
      // console.log("openFileDialog");
      const filters_extensions = ["zip"];
      fileSelector({
        filters_extensions: filters_extensions,
      }).then((result) => {
        if (Array.isArray(result) && result.length) {
          this.filePath = path.normalize(result[0]);
          // console.log(this.filePath);
        }
      });
    },
    // privateChange() {
    //   this.uploadData.isPrivate = this.checked;
    //   console.warn("privateChange");
    //   console.warn(this.uploadData);
    // },
    // fileChange(file, fileList) {
    //   this.filePath = file.raw.path;
    //   console.log(this.filePath);
    //   // const fileContent = fs.readFileSync(this.filePath);
    //   // const hashId = crypto.createHash("md5").update(fileContent).digest("hex");
    //   const userId = JSON.parse(localStorage.getItem("user")).id;
    //   this.headers = {
    //     // "Content-MD5": hashId,
    //     // Authorization: localStorage.getItem("access_token"),
    //     "X-Access-Token": localStorage.getItem("uiauto_access_token"),
    //   };
    //   this.uploadData = {
    //     // isPrivate: this.checked,
    //     // md5: hashId,
    //     biz: "zip_temp",
    //     userId: userId,
    //   };
    //   console.warn("uploadData");
    //   console.warn(this.uploadData);
    // },
    // beforeupload(file) {
    //   // console.log("beforeupload");
    //   // console.log(file.path);
    //   this.uploadTitle = "正在上传";
    //   this.uploadLoading = true;
    // },
    upload() {
      this.uploadTitle = "正在上传";
      this.uploadLoading = true;
      this.installPlugin();
      //this.$refs.upload.submit();
    },
    // uploadSuccess(response, file) {
    //   // console.log(file);
    //   this.uploadTitle = "正在安装";
    //   this.installPlugin();
    // },
    // uploadError(err, file) {
    //   this.uploadLoading = false;
    //   this.dialogSelectVisible = false;
    //   this.uploadTitle = "";
    //   this.$message({
    //     showClose: true,
    //     message: "上传失败",
    //     type: "error",
    //   });
    //   // ipc.send("open-error-dialog", "上传失败");
    // },
    installPlugin() {
      const self = this;
      this.uploadTitle = "正在安装";
      const pluginTempLastPath = path.normalize(
        `${config.pluginsPath}/../plugins_temp/`
      );
      const pluginTempPath = path.normalize(
        `${config.pluginsPath}/../plugins_temp/local/`
      );
      const pluginsPath = path.normalize(`${config.pluginsPath}/`);

      if (!fs.existsSync(pluginTempLastPath)) {
        fs.mkdirSync(pluginTempLastPath);
      }
      if (!fs.existsSync(pluginTempPath)) {
        fs.mkdirSync(pluginTempPath);
      }
      if (!fs.existsSync(pluginsPath)) {
        fs.mkdirSync(pluginsPath);
      }
      decompress(this.filePath, pluginTempPath, {
        filter: function (file) {
          var r = true;
          if (file.path.startsWith("__MACOSX")) {
            r = false;
          }
          if (file.type === "file" && file.path.endsWith("/")) {
            file.type = "directory";
          }
          return r;
        },
      })
        .then((files) => {
          const pluginName = _.takeRight(
            path.normalize(this.filePath).split(".")[0].split("\\")
          )[0];
          const targetFile = _.find(files, {
            type: "directory",
            path: `${pluginName}/`,
          });
          if (!files || !files.length) {
            this.importError(
              pluginName,
              "解压未发现存在文件",
              `${pluginTempPath}/${pluginName}`
            );
          } else if (!targetFile) {
            this.importError(
              pluginName,
              "文件格式有误",
              `${pluginTempPath}/${pluginName}`
            );
          } else if (
            _.includes(
              [
                "uiauto_executor",
                "uiauto_logMonitor",
                "uiauto_uiselector",
                "uiauto-chrome-plugin",
              ],
              pluginName
            )
          ) {
            const plugin_path = path.normalize(
              `${pluginTempPath}${pluginName}`
            );

            const versionLs = _.difference(fs.readdirSync(plugin_path), [
              ".DS_Store",
            ]).sort(this.versionFn);

            fse.copySync(
              path.normalize(
                `${plugin_path}/${versionLs[versionLs.length - 1]}`
              ),
              path.normalize(
                path.join(
                  path.resolve(),
                  `/public/base_integration/${pluginName}`
                )
              )
            );
            self.importSuccess(pluginName);
            fse.emptyDirSync(plugin_path);
            fs.rmdirSync(plugin_path);
          } else {
            let errorLs = [],
              successLs = [];
            const plugin_path = path.normalize(
              `${pluginTempPath}${pluginName}`
            );
            // 读取路径内文件夹名(版本号)
            const dirLs = _.compact(
              _.map(
                _.difference(fs.readdirSync(plugin_path), [".DS_Store"]),
                (item) => {
                  if (
                    fs
                      .statSync(path.normalize(`${plugin_path}/${item}`))
                      .isDirectory()
                  ) {
                    return path.normalize(`${plugin_path}/${item}`);
                  }
                }
              )
            );
            async.mapSeries(
              dirLs,
              (item, cb) => {
                if (fs.existsSync(path.normalize(`${item}/package.json`))) {
                  const package_json = fse.readJsonSync(
                    path.normalize(`${item}/package.json`)
                  );
                  if (package_json.language === "nodejs") {
                    fse.ensureDirSync(
                      path.normalize(
                        `${pluginsPath}/${pluginName}/${package_json.version}`
                      )
                    );
                    fse.move(
                      path.normalize(`${item}`),
                      path.normalize(
                        `${pluginsPath}/${pluginName}/${package_json.version}`
                      ),
                      {
                        overwrite: true,
                      },
                      (err) => {
                        if (err) {
                          errorLs.push({
                            pluginName: pluginName,
                            version: package_json.version,
                            err: err,
                            path: item,
                          });
                          fse.remove(
                            path.normalize(
                              `${pluginsPath}/${pluginName}/${package_json.version}`
                            )
                          );
                          cb(null, null);
                        } else {
                          nodeInit(
                            path.normalize(
                              `${pluginsPath}/${pluginName}/${package_json.version}`
                            )
                          )
                            .then((res) => {
                              successLs.push({
                                pluginName: pluginName,
                                version: package_json.version,
                              });
                              // self.initSuccess(pluginName, package_json.version);
                              cb(null, res);
                            })
                            .catch((err) => {
                              errorLs.push({
                                pluginName: pluginName,
                                version: package_json.version,
                                err: err,
                                path: path.normalize(
                                  `${pluginsPath}/${pluginName}/${package_json.version}`
                                ),
                              });
                              fse.remove(
                                path.normalize(
                                  `${pluginsPath}/${pluginName}/${package_json.version}`
                                )
                              );
                              cb(null, null);
                              // self.initError(
                              //   pluginName,
                              //   package_json.version,
                              //   err,
                              //   item
                              // );
                              // cb(err, null);
                            });
                        }
                      }
                    );
                  } else if (package_json.language === "python") {
                    pythonInit(path.normalize(item), package_json.version)
                      .then((res) => {
                        if (
                          !fs.existsSync(
                            path.normalize(
                              `${pluginsPath}/${pluginName}/${package_json.version}`
                            )
                          )
                        ) {
                          fse.ensureDirSync(
                            path.normalize(
                              `${pluginsPath}/${pluginName}/${package_json.version}`
                            )
                          );
                        }
                        fse.copySync(
                          path.normalize(`${item}`),
                          path.normalize(
                            `${pluginsPath}/${pluginName}/${package_json.version}`
                          )
                        );
                        successLs.push({
                          pluginName: pluginName,
                          version: package_json.version,
                        });
                        // self.initSuccess(pluginName, package_json.version);
                        cb(null, res);
                      })
                      .catch((err) => {
                        errorLs.push({
                          pluginName: pluginName,
                          version: package_json.version,
                          err: err,
                          path: item,
                        });
                        cb(null, null);
                        // self.initError(
                        //   pluginName,
                        //   package_json.version,
                        //   err,
                        //   item
                        // );
                        // cb(err, null);
                      });
                  } else {
                    if (
                      !fs.existsSync(
                        path.normalize(
                          `${pluginsPath}/${pluginName}/${package_json.version}`
                        )
                      )
                    ) {
                      fse.ensureDirSync(
                        path.normalize(
                          `${pluginsPath}/${pluginName}/${package_json.version}`
                        )
                      );
                    }
                    fse.copySync(
                      path.normalize(`${item}`),
                      path.normalize(
                        `${pluginsPath}/${pluginName}/${package_json.version}`
                      )
                    );
                    successLs.push({
                      pluginName: pluginName,
                      version: package_json.version,
                    });
                    // self.initSuccess(pluginName, package_json.version);
                    cb(1, null);
                  }
                } else {
                  errorLs.push({
                    pluginName: pluginName,
                    version: package_json.version,
                    err: "无法读取package.json文件，请检查文件完整性",
                    path: item,
                  });
                  cb(null, null);
                  // self.initError(
                  //   pluginName,
                  //   package_json.version,
                  //   "无法读取package.json文件，请检查文件完整性",
                  //   item
                  // );
                  // cb(1, null);
                }
              },
              (err, res) => {
                if (errorLs.length) {
                  self.initError(errorLs);
                  self.importError(pluginName, "文件安装有误");
                }
                if (successLs.length) {
                  self.initSuccess(successLs);
                  self.importSuccess(pluginName);
                }
                fse.emptyDirSync(`${pluginTempPath}/${pluginName}`);
                fs.rmdirSync(`${pluginTempPath}/${pluginName}`);
              }
            );
          }
        })
        .catch((err) => {
          console.log("decompress err", err);
          this.importError(
            pluginName,
            `文件解压失败`,
            `${pluginTempPath}/${pluginName}`
          );
        });
    },
    importSuccess(pluginName) {
      this.uploadLoading = false;
      this.dialogSelectVisible = false;
      this.uploadTitle = "";
      this.$message({
        showClose: true,
        message: `${pluginName}完成导入`,
        type: "success",
        duration: 5000,
      });
      this.$store.dispatch("plugin/refreshPugin");
    },
    importError(pluginName, err, path) {
      this.uploadLoading = false;
      this.dialogSelectVisible = false;
      this.uploadTitle = "";
      if (path) {
        fse.remove(path);
      }
      this.$message({
        showClose: true,
        duration: 5000,
        message: `${pluginName}导入失败：${err}`,
        type: "error",
      });
      // ipc.send("open-error-dialog", err);
    },
    initSuccess(successLs) {
      _.each(successLs, (item) => {
        this.notifyPromise = this.notifyPromise
          .then(this.$nextTick)
          .then(() => {
            this.$notify({
              title: "安装成功",
              message: `${item.pluginName}-${item.version}安装成功`,
              type: "success",
            });
          });
      });
      // this.$store.dispatch("plugin/refreshPugin");
    },
    initError(errorLs) {
      _.each(errorLs, (item) => {
        if (item.path) {
          fse.remove(item.path);
        }
        this.notifyPromise = this.notifyPromise
          .then(this.$nextTick)
          .then(() => {
            this.$notify({
              title: "安装失败",
              message: `${item.pluginName}-${item.version}安装失败：${item.err}`,
              type: "error",
            });
          });
      });
    },
    // 版本号排序
    versionFn(str1, str2) {
      var arr1 = str1.split(".");
      var arr2 = str2.split(".");
      var minLen = Math.min(arr1.length, arr2.length);
      var maxLen = Math.max(arr1.length, arr2.length);

      for (let i = 0; i < minLen; i++) {
        if (parseInt(arr1[i]) > parseInt(arr2[i])) {
          return 1;
        } else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
          return -1;
        }
        if (i + 1 == minLen) {
          if (arr1.length > arr2.length) {
            return 1;
          } else {
            return -1;
          }
        }
      }
    },
  },
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

::v-deep .el-input-group__append {
  background-color: #1890ff;
  color: #ffffff;
  border: 1px solid #1890ff;
}
</style>

