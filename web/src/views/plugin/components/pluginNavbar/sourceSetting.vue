<template>
  <div>
    <el-button class="button" type="primary" @click="dialogSelectVisible = true">设置依赖库源地址</el-button>
    <el-dialog title="设置依赖库源地址" :visible.sync="dialogSelectVisible" width="45%" center >
      <div>
        <el-row>
          <el-col :xs="6" :sm="3" :md="3" :lg="3" :xl="3">
            Python源
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="4">
            <el-select
              v-model="used_python_source_id"
              class="filter-item"
              @change="pythonSourceChange"
            >
              <el-option v-for="item in package_source.python" :key="item.name" :label="item.name" :value="item.id" />
            </el-select>
          </el-col>
          <el-col :xs="12" :sm="15" :md="15" :lg="15" :xl="16">
            <el-input v-model="used_python_source.url" :disabled="used_python_source.id != 'custom'"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="6" :sm="3" :md="3" :lg="3" :xl="3">
            Node.js源
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="4">
            <el-select
              v-model="used_nodejs_source_id"
              class="filter-item"
              @change="nodejsSourceChange"
            >
              <el-option v-for="item in package_source.nodejs" :key="item.name" :label="item.name" :value="item.id" />
            </el-select>
          </el-col>
          <el-col :xs="12" :sm="15" :md="15" :lg="15" :xl="16">
            <el-input v-model="used_nodejs_source.url" :disabled="used_nodejs_source.id != 'custom'"></el-input>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          style="color: #1890ff;border:1px solid #1890ff;"
          @click="dialogSelectVisible = false"
        >取 消</el-button>
        <el-button
          type="primary"
          style="color: white;"
          @click="save"
        >保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
var ipc = window.require("electron").ipcRenderer;
var app = window.require("electron").remote.app;
var fse = window.require("fs-extra");
var fs = window.require("fs");
const os = window.require("os");
var crypto = window.require("crypto");
var decompress = window.require("decompress");
var path = window.require("path");
// var { fileSelector } = require("@/utils/electron.js");
var { nodeInit, pythonInit } = require("@/utils/init.js");
import { uploadPlugin } from "@/api/plugin";
import config from "@/config/environment/index";
import environment from "@/config/environment";
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`;
const uiauto_config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

export default {
  data() {

    let package_source = {
      python:[{
        id: "PyPi",
        name: "PyPi",
        url: "https://pypi.python.org/simple",
        is_default: true
      }, {
        id: "custom",
        name: "自定义",
        url: "",
        is_default: false
      }],
      nodejs: [{
        id: "npm",
        name: "npm",
        url: "https://registry.npmjs.org/",
        is_default: true
      }, {
        id: "yarn",
        name: "yarn",
        url: "https://registry.yarnpkg.com/",
        is_default: false
      }, {
        id: "cnpm",
        name: "cnpm",
        url: "http://r.cnpmjs.org/",
        is_default: false
      }, {
        id: "taobao",
        name: "taobao",
        url: "https://registry.npm.taobao.org/",
        is_default: false
      }, {
        id: "custom",
        name: "自定义",
        url: "",
        is_default: false
      }]
    }

    uiauto_config.pipSource = _.unionBy(uiauto_config.pipSource, package_source.python, "id");
    uiauto_config.npmSource = _.unionBy(uiauto_config.npmSource, package_source.nodejs, "id");

    console.log(">>>>>>>>>>>.", uiauto_config.pipSource)
    let used_python_source = _.find(uiauto_config.pipSource, {is_default: true});
    let used_nodejs_source = _.find(uiauto_config.npmSource, {is_default: true});

    return {
      package_source: {
        python: uiauto_config.pipSource,
        nodejs: uiauto_config.npmSource
      },
      used_python_source_id: used_python_source.id,
      used_python_source: used_python_source,
      used_nodejs_source_id: used_nodejs_source.id,
      used_nodejs_source: used_nodejs_source,
      dialogSelectVisible: false
    };
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    pythonSourceChange(val) {
      this.used_python_source.is_default = false;
      this.used_python_source = _.find(this.package_source.python, {id: this.used_python_source_id});
      this.used_python_source.is_default= true;
    },
    nodejsSourceChange(val) {
      this.used_nodejs_source.is_default = false;
      this.used_nodejs_source = _.find(this.package_source.nodejs, {id: this.used_nodejs_source_id});
      this.used_nodejs_source.is_default= true;
    },
    pythonSourceUrlChange() {
      console.log(this.used_python_source.url)
      console.log(this.package_source.python)
    },
    save() {
      uiauto_config.pipSource = this.package_source.python;
      uiauto_config.npmSource = this.package_source.nodejs;

      fs.writeFileSync(configPath, JSON.stringify(uiauto_config, null, "\t"), 'utf8');

      this.dialogSelectVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.button {
  font-size: 12px;
  height: 30px !important;
  // width: 71px;
  color: white;
  //   background: #4a90e2;
  //   margin-top: 10px;
  //   margin-left: 10px;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  padding-left: 8px !important;
  padding-right: 8px !important;
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

