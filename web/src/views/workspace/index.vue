<template>
  <div>
    <div class="app-actionBar">
      <div class="left-menu">项目库</div>
      <div style="float: left; margin-top: 3px; margin-left: 30px">
        <el-button
          type="text"
          icon="el-icon-warning"
          style="color: #909399; font-size: 12px"
          v-if="JSON.stringify(download_plugin) != '{}'"
          @click="handleRemind"
          >插件下载信息</el-button
        >
      </div>

      <div class="action-button">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-folder-add"
          @click="createFolder()"
          >新建分类</el-button
        >
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-document-add"
          @click="createModel.showCreateDialog = true"
          >新建项目</el-button
        >
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-upload2"
          @click="importDialog = true"
          >导入项目</el-button
        >
        <!-- <el-button
          type="primary"
          size="mini"
          icon="el-icon-download"
          @click="downloadDemoFn"
          >下载示例</el-button
        > -->
        <el-button
          type="primary"
          size="mini"
          :disabled="syncProjectLoadding"
          :icon="
            !syncProjectLoadding ? 'el-icon-copy-document' : 'el-icon-loading'
          "
          @click="syncProject"
        >
          同步项目</el-button
        >
      </div>
      <div class="header-search">
        <el-input
          ref="headerSearchSelect"
          v-model.trim="searchInput"
          class="header-search-select"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter.native="getProjectList()"
        >
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>

      <div style="float: right; height: 40px">
        <el-button
          type="text"
          size="mini"
          icon="el-icon-loading"
          style="color: #999; line-height: 25px"
          v-if="restoreLoading"
          >正在修复旧版项目</el-button
        >
      </div>
    </div>

    <div class="app-container">
      <el-row class="panel-group">
        <el-col
          :xs="24"
          :sm="24"
          :lg="24"
          class="card-panel-col"
          v-for="(folder, idx) in projectLibraryList"
          :key="idx"
        >
          <Projectbox
            :key="idx"
            :list="folder.folderContent"
            :group="group"
            style="background-color: #c0c4cc; margin-bottom: 20px"
            :header-text="folder.folderName"
          />
        </el-col>
      </el-row>
    </div>

    <folder ref="childFolder" />
    <edit ref="editForm" />

    <el-dialog
      title="导入项目"
      :visible.sync="importDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
    >
      <el-dialog
        title="正在导入项目环境"
        width="25%"
        top="25vh"
        :visible.sync="uploadLoading"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        append-to-body
        center
      >
        <div style="text-align: center">
          <i class="el-icon-loading uploadLoading" />
        </div>
      </el-dialog>
      <div>
        <el-button
          type="primary"
          style="height: 32px; line-height: 7px"
          @click="exportProject()"
          >选择文件{{
            filePath.length ? `(已选${filePath.split(",").length}个)` : ""
          }}</el-button
        >
        <font>最多选择5个</font>
        <ul v-if="filePath" style="color: #999999; list-style-type: none">
          <li
            v-for="(item, idx) in filePath.split(',')"
            :key="idx"
            style="margin: 10px 0 10px -40px"
          >
            <a
              ><i class="el-icon-document"></i
              >{{ item.split("/")[item.split("/").length - 1] }}
            </a>
            <i class="el-icon-close" @click="handleDeleteFile(item)"></i>
          </li>
        </ul>
      </div>
      <div style="margin-top: 20px; text-align: center">
        <el-button
          type="primary"
          style="width: 70px; height: 32px; line-height: 7px"
          :disabled="filePath === ''"
          @click="upload()"
          >导入</el-button
        >
        <el-button
          style="
            color: #1890ff;
            border: 1px solid #1890ff;
            width: 70px;
            height: 32px;
            line-height: 7px;
          "
          @click="
            importDialog = false;
            filePath = '';
          "
          >取消</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
      title="新建项目"
      :visible.sync="createModel.showCreateDialog"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form label-position="left" label-width="90px" @submit.native.prevent>
        <el-form-item label="项目名称">
          <el-input
            v-model.trim="createModel.projectName"
            max="100"
            placeholder="请输入项目名称"
          />
        </el-form-item>
        <el-form-item label="项目分类">
          <el-select
            v-model="createModel.folderName"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in projectLibraryList"
              :key="item.folderName"
              :label="item.folderName"
              :value="item.folderName"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model.trim="createModel.description"
            type="textarea"
            :rows="8"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <div style="margin-top: 20px; text-align: center">
        <el-button
          type="primary"
          style="width: 70px; height: 32px; line-height: 7px"
          @click="commitHandleClick()"
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

    <el-dialog
      title="插件下载信息"
      class="remind"
      :visible.sync="showRemindDialog"
      center
      @closed="showRemindDialog = false"
      ><el-table :data="remindTableData" border height="400">
        <el-table-column
          prop="plugin_id"
          label="插件id"
          show-overflow-tooltip
        />
        <el-table-column prop="version" label="版本" show-overflow-tooltip />
        <el-table-column prop="errLog" label="错误信息" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
const JSZIP = require("jszip");
const async = require("async");
const fs = window.nodeRequire("fs");
const path = window.nodeRequire("path");
const fse = window.nodeRequire("fs-extra");
const decompress = window.nodeRequire("decompress");
const { fileSelector } = require("@/utils/electron.js");
const {
  pluginDownload,
  setQueryConfig,
  executeDownload,
} = require("@/utils/electron.js");
const {
  getSynchronizeParams,
  downloadDemo,
} = require("@/utils/synchronizeProject.js");
// const { execute } = window.nodeRequire(path.resolve() + "/public/runner/index.js");
import _ from "lodash";
import moment from "moment";
import environment from "@/config/environment";
import config from "@/config/environment/index";
import edit from "./components/edit";
import folder from "./components/folder";
import { getCloudProjects, pluginViews } from "@/api/plugin";
import Projectbox from "./components/Projectbox/index.vue";
import draggable from "vuedraggable";
import { uuid } from "vue-uuid";
import { remove } from "jszip";

const express_app = require("../../express/app");
express_app.start_server();

document.ondragover = function (e) {
  e.preventDefault();
};
document.ondrop = function (e) {
  e.preventDefault();
};

export default {
  name: "Workspace",
  components: {
    edit,
    folder,
    Projectbox,
    draggable,
  },
  data() {
    return {
      group: "mission",
      searchInput: "",
      createModel: {
        showCreateDialog: false,
        createProjectByfolder: false,
        folderName: "",
        projectName: "",
        description: "",
      },
      // 项目库路径
      projectsPath: `${config.projectsPath}/`,
      uploadLoading: false,
      filePath: "",
      importDialog: false,
      webPluginList: [],
      searchProjectLs: [],
      // 项目库列表
      projectLibraryList: [],
      syncProjectLoadding: false,
      showRemindDialog: false,
      remindTableData: [],
      // 修复旧项目loading
      restoreLoading: false,
    };
  },
  computed: {
    download_plugin() {
      return this.$store.state.plugin.pluginDownload;
    },
  },
  watch: {
    searchInput: function () {
      if (this.searchInput.length == 0) {
        this.getProjectList();
      }
    },
  },
  mounted() {
    this.checkLocalProject();
  },
  methods: {
    checkLocalProject() {
      this.restoreLoading = true;

      let files = _.difference(fs.readdirSync(`${config.projectsPath}`), [
        ".DS_Store",
      ]);
      async.mapSeries(
        files,
        (item, cb) => {
          if (fs.statSync(`${config.projectsPath}/${item}`).isDirectory()) {
            if (fs.existsSync(`${config.projectsPath}/${item}/${item}.json`)) {
              let json = fse.readJsonSync(
                `${config.projectsPath}/${item}/${item}.json`
              );
              if (json.project_type === "folder") {
                cb(null, null);
              } else {
                this.compatibleProject(json).then((res) => {
                  cb(null, null);
                });
              }
            } else {
              cb(null, null);
            }
          } else {
            cb(null, null);
          }
        },
        (err, res) => {
          this.getProjectList();
          this.restoreLoading = false;
        }
      );
    },
    getProjectList() {
      let self = this;
      this.projectLibraryList = [];
      if (config.projectsPath) {
        let projectLs = [],
          folderLs = [],
          hasFolderProjects = [];

        const files = _.difference(fs.readdirSync(`${config.projectsPath}`), [
          ".DS_Store",
        ]);
        files.forEach(function (fileName, index) {
          if (fs.statSync(`${config.projectsPath}/${fileName}`).isDirectory()) {
            if (
              fs.existsSync(
                `${config.projectsPath}/${fileName}/${fileName}.json`
              )
            ) {
              let json = fse.readJsonSync(
                `${config.projectsPath}/${fileName}/${fileName}.json`
              );
              if (json.project_type === "folder") {
                folderLs.push({
                  folderName: fileName,
                  projects: json.projects,
                });
              } else {
                projectLs.push({
                  project_name: fileName,
                  name: json.name,
                  project_type: json.project_type || "",
                  json: json,
                  date: moment(json.updateAt).format("YYYY-MM-DD"),
                });
              }
            }
          }
        });
        _.each(folderLs, (folderItem) => {
          let temp_folder = {
            folderName: folderItem.folderName,
            folderContent: [],
          };
          _.each(projectLs, (projectItem) => {
            if (this.searchInput.length) {
              if (
                folderItem.projects.includes(projectItem.project_name) &&
                projectItem.name.indexOf(this.searchInput) > -1
              ) {
                temp_folder.folderContent.push(projectItem);
                hasFolderProjects.push(projectItem);
              }
            } else {
              if (folderItem.projects.includes(projectItem.project_name)) {
                temp_folder.folderContent.push(projectItem);
                hasFolderProjects.push(projectItem);
              }
            }
          });
          if (this.searchInput.length) {
            if (temp_folder.folderContent.length) {
              this.projectLibraryList.push(temp_folder);
            }
          } else {
            this.projectLibraryList.push(temp_folder);
          }
        });

        let otherProjects = _.differenceBy(
          projectLs,
          hasFolderProjects,
          "project_name"
        );
        if (this.searchInput.length) {
          let searchProjectLs = [];
          _.each(otherProjects, (item, idx) => {
            if (item.name.indexOf(this.searchInput) > -1) {
              searchProjectLs.push(item);
            }
          });
          if (searchProjectLs.length) {
            this.projectLibraryList.push({
              folderName: "未分类",
              folderContent: searchProjectLs,
            });
          }
        } else {
          this.projectLibraryList.push({
            folderName: "未分类",
            folderContent: otherProjects,
          });
        }
      }
    },
    // 取消按钮
    handleReset() {
      this.createModel = {
        showCreateDialog: false,
        createProjectByfolder: false,
        folderName: "",
        projectName: "",
        description: "",
      };
    },
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
    // 确定按钮
    commitHandleClick() {
      let _uuid = uuid.v1();
      this.createModel.projectName = this.createModel.projectName
        .replace(/\//g, "")
        .replace(/\\/g, "");
      if (!config.projectsPath) {
        return this.$message.warning("请先到系统管理设置项目路径");
      }
      if (!this.createModel.projectName.trim()) {
        return this.$message.warning("项目名称不能为空");
      }
      let createFileJsonPath = `${config.projectsPath}/${_uuid}/${_uuid}.json`;
      if (fs.existsSync(createFileJsonPath)) {
        this.$message.warning("出现异常请重试！");
      } else {
        if (
          !_.includes(
            _.difference(fs.readdirSync(config.pluginsPath), [".DS_Store"]),
            "base"
          )
        ) {
          return this.$message.error("请先下载通用组件 -- base插件");
        } else {
          const versionLs = _.difference(
            fs.readdirSync(`${config.pluginsPath}/base`),
            [".DS_Store"]
          ).sort(this.versionFn);
          if (!fs.existsSync(`${config.projectsPath}/${_uuid}`)) {
            fse.ensureDirSync(`${config.projectsPath}/${_uuid}`);
            let writeJson = _.extend(
              { project_name: _uuid },
              { name: this.createModel.projectName },
              { project_type: "local" },
              { createAt: moment().format("YYYY-MM-DD HH:mm:ss") },
              { updateAt: moment().format("YYYY-MM-DD HH:mm:ss") },
              { cron: "" },
              { retry_count: "" },
              { retry_interval: "" },
              { time_out: "" },
              { description: this.createModel.description },
              {
                nodes: [
                  {
                    "v-146d869c": "",
                    type: "node",
                    shape: "flow-circle",
                    shapeType: "Start",
                    size: "44*44",
                    label: "开始",
                    color: "#79C900",
                    operation_id: "start",
                    plugin_id: "base",
                    input: [],
                    output: {},
                    version: versionLs[versionLs.length - 1],
                    x: 417.171875,
                    y: 61.5,
                    id: "a9043c87",
                    index: 0,
                    general_property: [
                      {
                        id: "retry_count",
                        value: "1",
                        name: "重试次数",
                      },
                      {
                        id: "retry_interval",
                        value: "50",
                        name: "重试时间间隔(ms)",
                      },
                      {
                        id: "execution_timeout",
                        value: "5000",
                        name: "执行超时时间(ms)",
                      },
                      {
                        id: "delayed_execution_time",
                        value: "50",
                        name: "延迟执行时间(ms)",
                      },
                      {
                        id: "waiting_time_after_execution",
                        value: "50",
                        name: "执行后等待时间",
                      },
                    ],
                  },
                  {
                    "v-146d869c": "",
                    type: "node",
                    shape: "flow-circle",
                    shapeType: "End",
                    size: "44*44",
                    label: "结束",
                    color: "#DC3C00",
                    operation_id: "end",
                    plugin_id: "base",
                    input: [],
                    output: {},
                    version: versionLs[versionLs.length - 1],
                    x: 417.671875,
                    y: 211.5,
                    id: "9e189b9d",
                    index: 1,
                    general_property: [
                      {
                        id: "retry_count",
                        value: "1",
                        name: "重试次数",
                      },
                      {
                        id: "retry_interval",
                        value: "50",
                        name: "重试时间间隔(ms)",
                      },
                      {
                        id: "execution_timeout",
                        value: "5000",
                        name: "执行超时时间(ms)",
                      },
                      {
                        id: "delayed_execution_time",
                        value: "50",
                        name: "延迟执行时间(ms)",
                      },
                      {
                        id: "waiting_time_after_execution",
                        value: "50",
                        name: "执行后等待时间",
                      },
                    ],
                  },
                ],
              }
            );
            fs.writeFileSync(
              createFileJsonPath,
              JSON.stringify(writeJson, null, "\t"),
              "utf8"
            );
          }
          this.$router.push({
            path: "/project",
            query: {
              currentProjectName: "",
              currentProjectType: "",
              redirectProjectName: _uuid,
              redirectProjectType: "local",
            },
          });
          // 在文件夹点击创建任务自动归到文件夹中
          if (
            (this.createModel.createProjectByfolder ||
              this.createModel.folderName) &&
            this.createModel.folderName != "未分类"
          ) {
            let json = fse.readJsonSync(
              `${config.projectsPath}/${this.createModel.folderName}/${this.createModel.folderName}.json`
            );
            json["projects"].push(_uuid);
            json["projects_name"].push(this.createModel.projectName);
            json["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

            fse.writeFileSync(
              `${config.projectsPath}/${this.createModel.folderName}/${this.createModel.folderName}.json`,
              JSON.stringify(json, null, "\t"),
              "utf8"
            );
          }
          this.handleReset();
        }
      }
    },
    compatibleProject(json) {
      return new Promise((resolve, reject) => {
        let _json = _.cloneDeep(json);
        if (
          !_json.project_name ||
          !_json.name ||
          !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            _json.project_name
          )
        ) {
          let _uuid = uuid.v1();
          _json["name"] = json.project_name;
          _json["project_name"] = _uuid;
          _json["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

          // 先备份旧项目
          this.handBackupFolder(
            0,
            _uuid,
            json.project_name,
            `${config.projectsPath}/${json.project_name}`
          );

          fse.writeFileSync(
            `${config.projectsPath}/${_uuid}/${_uuid}.json`,
            JSON.stringify(_json, null, "\t"),
            "utf8"
          );

          resolve({
            isSuccess: true,
            json: _json,
          });
        } else {
          resolve({
            isSuccess: true,
            json: json,
          });
        }
      });
    },
    handleSetLineChartData(val) {
      console.log("我被点击啦~~");
      this.compatibleProject(val.json).then((res) => {
        if (res.isSuccess) {
          this.$router.push({
            path: "/project",
            query: {
              currentProjectName: "",
              currentProjectType: "",
              redirectProjectName: res.json.project_name,
              redirectProjectType: res.json.project_type,
            },
          });
        }
      });
    },
    // 操作
    handleOperate(params, folder_name) {
      if (!params.isDownloading) {
        this.compatibleProject(params.json).then((res) => {
          if (res.isSuccess) {
            this.$refs["editForm"] &&
              this.$refs["editForm"].show({ json: res.json }, folder_name);
          }
        });
      } else {
        this.$message.warning("该项目暂无法操作");
      }
    },
    // 压缩项目文件
    download(params, type) {
      const self = this;
      const zip = new JSZIP();
      let targetDir = `${config.projectsPath}/${params.project_name}`;

      const target = zip.folder(params.project_name);
      this.readDir(target, targetDir);
      return zip
        .generateAsync({
          // 设置压缩格式，开始打包
          type: "nodebuffer", // nodejs用
          compression: "DEFLATE", // 压缩算法
          compressionOptions: {
            // 压缩级别
            level: 9,
          },
        })
        .then(function (content) {
          zip.remove(params.project_name);
          if (!fs.existsSync(self.projectsPath + "../zip/")) {
            fse.ensureDirSync(self.projectsPath + "../zip/");
          }
          fs.writeFileSync(
            `${self.projectsPath}../zip/${params.name}_${params.project_name}.zip`,
            content,
            "utf-8"
          ); // 将打包的内容写入zip中

          if (type == "download") {
            let dirPath = path
              .normalize(
                `${config.projectsPath}/../zip/${
                  params.name + "_" + params.project_name + ".zip"
                }`
              )
              .replace(/\\/g, "/");
            self.$message({
              type: "success",
              dangerouslyUseHTMLString: true,
              message: `项目导出成功，导出路径：${dirPath}   <strong style="cursor:pointer;" onclick='openDir("${dirPath}")'><font style="color: #3582fb;">点击打开</font></strong>`,
            });
          } else {
            return path.normalize(
              `${self.projectsPath}../zip/${params.name}_${params.project_name}.zip`
            );
          }
        });
    },
    // 读取目录及文件
    readDir(zip, nowPath) {
      const self = this;
      const files = fs.readdirSync(nowPath); // 读取目录中的所有文件及文件夹（同步操作）
      files.forEach(function (fileName, index) {
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
    // 导入项目
    exportProject() {
      var self = this;
      fileSelector({
        properties: ["openFile", "multiSelections"],
        filters_extensions: ["zip"],
      }).then((result) => {
        if (Array.isArray(result)) {
          if (_.compact(self.filePath.split(",")).length + result.length > 5) {
            self.$message.error("文件个数超过5个");
            return;
          }
          self.filePath = _.compact(self.filePath.split(",").concat(result))
            .join(",")
            .replace(/\\/g, "/");
        }
      });
    },
    // 删除导入文件
    handleDeleteFile(item) {
      let temp = this.filePath.split(",");
      _.remove(temp, (temp_item) => {
        return temp_item == item;
      });
      this.filePath = temp.join(",");
    },
    // 导入事件
    upload() {
      const self = this;
      if (!config.projectsPath) {
        this.$message.warning("请先到系统管理设置项目路径");
        return;
      }
      this.importDialog = false;
      this.uploadLoading = true;
      for (let filePathItem of _.compact(this.filePath.split(","))) {
        let targetPathCut = filePathItem.replace(/\\/g, "/").split("/");
        let projectName = targetPathCut[targetPathCut.length - 1]
          .split(".zip")[0]
          .split("_")[
          targetPathCut[targetPathCut.length - 1].split(".zip")[0].split("_")
            .length - 1
        ];

        let projectTempPath = `${config.projectsPath}/../projects_temp/${projectName}`;
        let projectsPath = config.projectsPath + "/";

        if (!fs.existsSync(projectTempPath)) {
          fse.ensureDirSync(projectTempPath);
        }
        if (!fs.existsSync(projectsPath)) {
          fse.ensureDirSync(projectsPath);
        }

        decompress(filePathItem, projectTempPath, {
          filter: function (file) {
            var r = true;
            if (file.path.startsWith("__MACOSX")) {
              r = false;
            }
            return r;
          },
        })
          .then((files) => {
            if (files && files.length) {
              const file = _.find(files, {
                path: `${projectName}/${projectName}.json`,
              });
              if (file) {
                var readJson = fse.readJsonSync(
                  projectTempPath + "/" + file.path
                );
                // 导入的json文件校验
                if (
                  !fs.existsSync(projectTempPath) ||
                  readJson.project_name !== projectName ||
                  (readJson.nodes && !readJson.nodes.length) ||
                  (readJson.edges && !readJson.edges.length)
                ) {
                  self.uploadLoading = false;
                  fse.emptyDirSync(projectTempPath);
                  fs.rmdirSync(projectTempPath);
                  self.$message.error("包内文件不合法，请检查包内容后再试!");
                } else {
                  // 本地系统里所有插件
                  let localPlugins = [],
                    // 导入项目里所需要的插件
                    projectPlugins = [],
                    // 需要从云端下载的插件
                    downPlugins = [],
                    // 云端所有插件
                    onlinePlugins = [];

                  _.each(
                    _.difference(fs.readdirSync(config.pluginsPath), [
                      "list.json",
                      "npm_i.sh",
                      ".DS_Store",
                    ]),
                    (item) => {
                      let versions = _.difference(
                        fs.readdirSync(`${config.pluginsPath}/${item}`),
                        [".DS_Store"]
                      );
                      localPlugins = _.concat(
                        localPlugins,
                        _.map(versions, (versionItem) => {
                          return {
                            plugin_id: item,
                            version: versionItem,
                          };
                        })
                      );
                    }
                  );

                  _.each(readJson.nodes, (item) => {
                    if (
                      !_.find(projectPlugins, {
                        plugin_id: item.plugin_id,
                        version: item.version,
                      })
                    ) {
                      projectPlugins.push({
                        plugin_id: item.plugin_id,
                        version: item.version,
                      });
                    }
                  });

                  // 需要从云端下载的插件
                  downPlugins = _.differenceWith(
                    projectPlugins,
                    localPlugins,
                    _.isEqual
                  );
                  pluginViews({
                    PluginIds: _.map(downPlugins, "plugin_id").join(","),
                  }).then((result) => {
                    _.map(result.result, (item) => {
                      let newPluginObj = _.cloneDeep(item);
                      newPluginObj.plugin_id = item.pluginId;
                      delete newPluginObj.pluginId;
                      onlinePlugins.push(newPluginObj);
                      return item;
                    });
                    // 检查是否已存在该项目 -->  将存放在临时文件夹的项目转移进项目库
                    const downloadPlugin = function () {
                      var cloneProjectTempPath = _.cloneDeep(projectTempPath);
                      files[0].type === "directory" &&
                        (cloneProjectTempPath =
                          cloneProjectTempPath + "/" + files[0].path);
                      let isExists = false;
                      if (
                        fs.existsSync(
                          projectsPath +
                            projectName +
                            "/" +
                            projectName +
                            ".json"
                        )
                      ) {
                        isExists = true;
                      }
                      self.filePath = "";
                      self.$message.success(
                        isExists ? "导入的项目已存在，已替换成功!" : "导入成功!"
                      );
                      fse.moveSync(
                        cloneProjectTempPath,
                        projectsPath + projectName,
                        {
                          overwrite: true,
                        }
                      );
                      fse.emptyDirSync(cloneProjectTempPath);
                      try {
                        fs.rmdirSync(cloneProjectTempPath);
                        fs.rmdirSync(projectTempPath);
                      } catch (error) {}
                      self.getProjectList();
                    };
                    if (downPlugins.length) {
                      // 需要从云端下载的插件  本地不存在 && 云端不存在
                      let abnormalPlugins = _.differenceWith(
                        downPlugins,
                        _.map(onlinePlugins, (item) => {
                          return {
                            plugin_id: item.plugin_id,
                            version: item.version,
                          };
                        }),
                        _.isEqual
                      );
                      if (abnormalPlugins.length) {
                        self
                          .$confirm(
                            `检测到有部分插件本地且云端不存在，是否继续导入项目？`,
                            "提示",
                            {
                              confirmButtonText: "是",
                              cancelButtonText: "否",
                              type: "warning",
                            }
                          )
                          .then(() => {
                            downloadPlugin();
                          });
                      } else {
                        // 需要从云端下载的插件  本地不存在 && 云端存在
                        let needDownPlugins = [];
                        _.each(onlinePlugins, (onlinePluginItem) => {
                          _.each(downPlugins, (downPluginItem) => {
                            if (
                              onlinePluginItem.plugin_id ==
                                downPluginItem.plugin_id &&
                              onlinePluginItem.version == downPluginItem.version
                            ) {
                              needDownPlugins.push(onlinePluginItem);
                            }
                          });
                        });
                        this.pluginDownloadFn(needDownPlugins).then((res) => {
                          if (res) {
                            let message_target = _.uniqWith(
                              _.map(_.compact(res), (item) => {
                                return `${item.plugin_id} - ${item.version}`;
                              }),
                              _.isEqual
                            );
                            if (message_target.length) {
                              this.$notify({
                                title: "警告",
                                dangerouslyUseHTMLString: true,
                                message: `检测到<br />${
                                  message_target.length > 5
                                    ? `${_.chunk(message_target, 5)[0].join(
                                        "<br />"
                                      )} 等${message_target.length - 5}个...`
                                    : message_target.join("<br />")
                                } <br />以上插件版本安装失败，请前往插件库手动下载！`,
                                type: "warning",
                              });
                            }
                          }
                          downloadPlugin();
                        });
                      }
                    } else {
                      downloadPlugin();
                    }
                  });
                }
              } else {
                self.filePath = "";
                self.uploadLoading = false;
                self.$message.error("zip包名与包内项目名不匹配!");
              }
            } else {
              self.uploadLoading = false;
              self.$message.error(`${filePathItem}未解压出文件`);
            }
          })
          .catch((err) => {
            console.error(err);
            self.uploadLoading = false;
            self.$message.error("文件解压失败");
          });
      }
      this.filePath = "";
      this.uploadLoading = false;
    },
    // 获取云端插件
    pluginViewsFn() {
      return new Promise((resolve, reject) => {
        pluginViews({
          needs: "last",
        })
          .then((result) => {
            var webPluginViews = [];
            _.map(result.result, (item) => {
              let newPluginObj = _.cloneDeep(item);
              newPluginObj.plugin_id = item.pluginId;
              delete newPluginObj.pluginId;
              webPluginViews.push(newPluginObj);
              return item;
            });
            resolve(webPluginViews);
          })
          .catch((err) => {
            console.error(err);
            reject();
          });
      });
    },
    // 下载插件
    pluginDownloadFn(needDownPlugins) {
      return new Promise((resolve, reject) => {
        async.mapSeries(
          needDownPlugins,
          (plugin, cb) => {
            let _plugin = _.cloneDeep(plugin);
            _plugin.isUiautoBaseIntegration = eval(
              plugin.isUiautoBaseIntegration
            );

            // 下载插件
            executeDownload(_plugin)
              .then((result) => {
                cb(null, null);
              })
              .catch((err) => {
                cb(null, {
                  plugin_id: plugin.plugin_id,
                  version: plugin.version,
                });
              });
          },
          (err, res) => {
            resolve(res);
          }
        );
      });
    },
    // 删除文件夹
    handleDeleteFolder(path) {
      let files = [];
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
          const curPath = path + "/" + file;
          if (fs.statSync(curPath).isDirectory()) {
            this.handleDeleteFolder(curPath); // 递归删除文件夹
          } else {
            fs.unlinkSync(curPath); // 删除文件
          }
        });
        fs.rmdirSync(path);
      }
      this.getProjectList();
    },
    // 备份文件夹
    handBackupFolder(idx, _uuid, project_name, folderPath) {
      let _folderPath = folderPath.replace(project_name, _uuid);
      if (!idx) {
        // 备份旧项目
        if (fs.existsSync(`${folderPath}/${project_name}.json`)) {
          fs.copyFileSync(
            `${folderPath}/${project_name}.json`,
            `${folderPath}/${project_name}_backup.json`
          );
        }
        // 先修改外层文件夹名
        fs.renameSync(folderPath, _folderPath);
      }

      let files = [];
      if (fs.existsSync(_folderPath)) {
        files = fs.readdirSync(_folderPath);
        files.forEach((file, index) => {
          const curPath = _folderPath + "/" + file;
          if (fs.statSync(curPath).isDirectory()) {
            this.handBackupFolder(1, _uuid, project_name, curPath);
          } else {
            if (curPath != `${_folderPath}/${project_name}_backup.json`) {
              fs.renameSync(curPath, curPath.replace(project_name, _uuid));
            }
          }
        });
      }
    },
    // 搜索
    searchFn() {
      this.searchProjectLs = [];
      if (this.searchInput.length) {
        _.each(this.projectLs, (item, idx) => {
          if (item.project_name.indexOf(this.searchInput) > -1) {
            this.searchProjectLs.push(item);
          }
        });
        if (!this.searchProjectLs.length) {
          this.$message.warning("找不到该项目");
        }
      }
    },
    // 同步项目
    syncProject() {
      this.syncProjectLoadding = true;
      getCloudProjects({
        type: "dev",
      }).then((getCloudProjectsRes) => {
        if (getCloudProjectsRes.result.data.length) {
          getSynchronizeParams(getCloudProjectsRes.result.data)
            .then((res) => {
              if (res.isSuccess) {
                this.$message.success(res.message);
                this.syncProjectLoadding = false;
                this.getProjectList();
              } else {
                this.syncProjectLoadding = false;
              }
            })
            .catch((err) => {
              this.$message.error("同步失败");
              this.syncProjectLoadding = false;
            });
        } else {
          this.syncProjectLoadding = false;
          this.$message.success("没有需要同步的项目");
        }
      });
    },
    createFolder() {
      this.$refs["childFolder"].createFolder();
    },
    // 下载示例
    downloadDemoFn() {
      let self = this;
      if (fs.existsSync(`${config.projectsPath}/示例项目`)) {
        this.$message.warning("您本地已存在示例项目，无需重复下载！");
      } else {
        // downloadDemo(`${config.serverUrl}/src/files/示例项目.zip`)
        downloadDemo(`http://rpa-api.legion-tech.net/src/files/示例项目.zip`)
          .then((res) => {
            setTimeout(() => {
              self.checkLocalProject();
            }, 500);
            this.$message.success("成功下载示例项目");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    // 插件安装警告
    handleRemind() {
      this.remindTableData = [];
      _.each(this.download_plugin, (item) => {
        this.remindTableData.push({
          plugin_id: item.plugin_id,
          version: item.version,
          errLog: item.errLog,
        });
      });
      this.showRemindDialog = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.el-button + .el-button {
  margin: 0;
}
::v-deep .el-dialog {
  margin-top: 18vh !important;
  font-size: 14px;
  font-weight: bold;
  width: 31%;
  border-radius: 10px;
}

::v-deep .el-tabs--border-card {
  width: calc(100% - 20px);
  border: none;
  box-shadow: none;
  background: transparent;
}

::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}

::v-deep .el-tabs__nav {
  float: right;
}

::v-deep .el-input__inner {
  height: 32px;
}
</style>
