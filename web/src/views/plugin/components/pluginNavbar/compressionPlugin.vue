<template>
  <div>
    <el-dialog title="压缩插件" width="40%" :visible.sync="dialogFormVisible" center>
      <el-form label-position="top" label-width="80px">
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="插件路径" prop="name">
              <el-input
                id="filePath_input"
                v-model="filePath"
                type="text"
                placeholder="请选择插件路径"
                style="width:80%;"
              ></el-input>
              <el-button type="primary" @click="openFileDialog('filePath_input', 'filePath')">
                <i class="el-icon-folder-opened" />
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="输出路径" prop="name">
              <el-input
                id="outputPath_input"
                v-model="outputPath"
                type="text"
                placeholder="请选择输出路径"
                style="width:80%;"
              ></el-input>
              <el-button type="primary" @click="openFileDialog('filePath_input', 'outputPath')">
                <i class="el-icon-folder-opened" />
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCompression()">压 缩</el-button>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import _ from "lodash";
import config from "@/config/environment/index";
const { fileSelector } = require("@/utils/electron.js");
const JSZIP = require("jszip");
const async = require("async");
const fs = window.require("fs");
const os = window.require("os");
const path = window.require("path");
const fse = window.require("fs-extra");
const { nodeGenerateCache, pythonGenerateCache } = require("@/utils/init.js");

export default {
  data() {
    return {
      dialogFormVisible: false,
      filePath: "",
      outputPath: ""
    };
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    reset() {
      this.dialogFormVisible = false;
      this.filePath = "";
      this.outputPath = "";
    },
    show() {
      this.dialogFormVisible = true;
    },
    openFileDialog(id, path) {
      let self = this;
      document.getElementById(id).blur();
      fileSelector({ properties: ["openDirectory"] }).then(result => {
        if (Array.isArray(result)) {
          path === "filePath"
            ? (self.filePath = result[0])
            : (self.outputPath = result[0]);
        }
      });
    },
    handleCompression() {
      let self = this;
      if (this.filePath && this.outputPath) {
        this.$message({
          message: `正在生成插件缓存文件，请稍候...`,
          type: "success"
        });
        this.dialogFormVisible = false;
        let plugin_name = _.takeRight(path.normalize(this.filePath).split("/"))[0];
        let plugin_path = `${config.pluginsPath}/../plugins_temp/${plugin_name}`;
        if (
          _.includes(
            [
              "uiauto_executor",
              "uiauto_logMonitor",
              "uiauto_uiselector",
              "uiauto-chrome-plugin"
            ],
            plugin_name
          )
        ) {
          fse.ensureDirSync(
            `${plugin_path}/${
              fse.readJsonSync(`${this.filePath}/package.json`).version
            }`
          );
          // 插件文件夹复制到temp文件夹中
          fse.copySync(
            this.filePath,
            `${plugin_path}/${
              fse.readJsonSync(`${this.filePath}/package.json`).version
            }`
          );
        } else {
          fse.ensureDirSync(plugin_path);
          // 插件文件夹复制到temp文件夹中
          fse.copySync(this.filePath, plugin_path);
        }

        // 读取路径内文件夹名(版本号)
        let dirLs = _.compact(
          _.map(
            _.difference(fs.readdirSync(plugin_path), [".DS_Store"]),
            item => {
              if (fs.statSync(`${plugin_path}/${item}`).isDirectory()) {
                return `${plugin_path}/${item}`;
              }
            }
          )
        );
        let innerAllPromise = [];
        // 分别到各版本文件夹中生成缓存文件
        _.each(dirLs, item => {
          if (
            _.includes(
              [
                "uiauto_executor",
                "uiauto_logMonitor",
                "uiauto_uiselector",
                "uiauto-chrome-plugin"
              ],
              plugin_name
            )
          ) {
            Promise.resolve();
          } else {
            if (fs.existsSync(`${item}/package.json`)) {
              let package_json = fse.readJsonSync(`${item}/package.json`);
              if (package_json.language === "nodejs") {
                innerAllPromise.push(nodeGenerateCache(item));
              } else if (package_json.language === "python") {
                innerAllPromise.push(pythonGenerateCache(item));
              }
            }
          }
        });
        Promise.all(innerAllPromise).then(innerAllPromiseRes => {
          // 压缩插件
          const zip = new JSZIP();
          const target = zip.folder(plugin_name);
          self.readDir(target, plugin_path);
          zip
            .generateAsync({
              // 设置压缩格式，开始打包
              type: "nodebuffer", // nodejs用
              compression: "DEFLATE", // 压缩算法
              compressionOptions: {
                // 压缩级别
                level: 9
              }
            })
            .then(function(content) {
              zip.remove(plugin_name);
              // 将打包的内容写入zip中
              fs.writeFileSync(
                `${self.outputPath}/${plugin_name}.zip`,
                content,
                "utf-8"
              );
              self.deleteFolder(`${plugin_path}`);
              self.$message({
                message: `插件'${plugin_name}'压缩成功`,
                type: "success"
              });
              self.reset();
            });
        });
      } else {
        this.$message({
          type: "warning",
          message: `请选择路径`
        });
      }
    },
    // 读取目录及文件
    readDir(zip, nowPath) {
      const self = this;
      const files = fs.readdirSync(nowPath); // 读取目录中的所有文件及文件夹（同步操作）
      files.forEach(function(fileName, index) {
        if (fileName !== ".DS_Store") {
          // 遍历检测目录中的文件
          const fillPath = nowPath + "/" + fileName;
          const file = fs.statSync(fillPath); // 获取一个文件的属性
          if (file.isDirectory()) {
            // 如果是目录的话，继续查询
            const dirlist = zip.folder(fileName); // 压缩对象中生成该目录
            self.readDir(dirlist, fillPath); // 重新检索目录文件
          } else {
            zip
              // .folder(fileName.split(".")[0])
              .file(fileName, fs.readFileSync(fillPath)); // 压缩目录添加文件
          }
        }
      });
    },
    // 清空文件夹
    deleteFolder(path) {
      let files = [];
      let self = this;
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file, index) {
          let curPath = `${path}/${file}`;
          if (fs.statSync(curPath).isDirectory()) {
            // recurse
            self.deleteFolder(curPath);
          } else {
            // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>