<template>
  <div style="background: #eeeeee;">
    <div id="navbar" style="background: #eeeeee;">
      <div class="navbar">
        <div class="left-menu">项目库</div>
        <el-button
          class="button"
          type="primary"
          size="mini"
          style="float:right;margin:5px 15px 5px 0;height:30px;"
          @click="downloadDemoFn"
        >下载示例</el-button>
        <el-button
          class="button"
          type="primary"
          size="mini"
          style="float:right;margin:5px 15px 5px 0;height:30px;"
          @click="syncProject"
        >同步项目</el-button>
        <el-button
          class="button"
          type="primary"
          size="mini"
          style="float:right;margin:5px 15px;height:30px;"
          @click="dialogSelectVisible = true"
        >导入项目</el-button>
        <el-dialog title="导入项目" :visible.sync="dialogSelectVisible" width="30%" center>
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
            <div class="loading">
              <i class="el-icon-loading uploadLoading" />
            </div>
          </el-dialog>
          <div class-name="small-padding fixed-width">
            <el-input
              v-model="filePath"
              autocomplete="off"
              :readonly="true"
              style="width:70%;height:32px;"
            />
            <el-button
              type="primary"
              style="height:32px;line-height: 7px;"
              @click="exportProject()"
            >选择文件</el-button>
          </div>
          <div style="margin-top: 30px;">
            <el-button
              type="primary"
              style="width: 70px;height: 32px;line-height: 7px;"
              :disabled="filePath === ''"
              @click="upload()"
            >导入</el-button>
            <el-button
              style="color: #1890ff;border:1px solid #1890ff;width: 70px;height: 32px;line-height: 7px;"
              @click="dialogSelectVisible = false;filePath = '';"
            >取消</el-button>
          </div>
        </el-dialog>
        <div :class="{'showSearch':showSearch}" class="header-search">
          <svg-icon class-name="search-icon" icon-class="search" @click.stop="searchClick" />
          <el-input
            ref="headerSearchSelect"
            v-model="search"
            class="header-search-select"
            placeholder="请输入项目名称"
            clearable
            @keyup.enter.native="searchFn()"
          />
        </div>
      </div>
      <div class="welcome-container">
        <div class="dashboard-editor-container">
          <el-row v-if="isShowCreate" :gutter="40" class="panel-group" style="margin-bottom: 20px;">
            <el-col
              :xs="12"
              :sm="12"
              :lg="6"
              class="card-panel-col-created"
              @click.native="showDialog = true"
            >
              <div class="card-panel">
                <div class="card-panel-icon-wrapper icon-edit">
                  <svg-icon icon-class="edit" class-name="card-panel-icon" />
                </div>
                <div class="card-panel-description" style="margin:51px 0;width: 100%;">
                  <div class="card-panel-text" style="color:#1890ff;">新建项目</div>
                </div>
              </div>
            </el-col>
            <el-col
              :xs="12"
              :sm="12"
              :lg="6"
              class="card-panel-col-created"
              @click.native="createFolder()"
            >
              <div class="card-panel">
                <div class="card-panel-icon-wrapper icon-edit">
                  <svg-icon icon-class="createfolder" class-name="card-panel-icon" />
                </div>
                <div class="card-panel-description" style="margin:51px 0;width: 100%;">
                  <div class="card-panel-text" style="color:#1890ff;">新建文件夹</div>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-tabs
            type="border-card"
            v-model="activeName"
            @tab-click="handleTabClick"
            :before-leave="beforeLeave"
          >
            <div
              v-if="showTip"
              style="height: 60px;line-height: 60px;text-align: center;color: #909399;"
            >请到系统管理设置项目路径</div>
            <el-tab-pane v-if="!isShowCreate" label="新建项目" name="新建项目">
              <span slot="label">
                <svg-icon icon-class="edit" class-name="card-panel-icon" />新建项目
              </span>
            </el-tab-pane>
            <el-tab-pane v-if="!isShowCreate" label="新建文件夹" name="新建文件夹">
              <span slot="label">
                <svg-icon icon-class="createfolder" class-name="card-panel-icon" />新建文件夹
              </span>
            </el-tab-pane>
            <el-tab-pane label="项目宫格" name="项目宫格">
              <span slot="label">
                <i class="el-icon-s-grid" /> 项目宫格
              </span>
            </el-tab-pane>
            <el-tab-pane label="项目列表" name="项目列表">
              <span slot="label">
                <i class="el-icon-s-unfold" /> 项目列表
              </span>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
    <div
      v-if="currentTab === '项目宫格'"
      class="welcome-container"
      style="padding: 0px 10px 10px 10px;width: 100%;position: absolute;top: 249px;background: #eeeeee;"
    >
      <el-row class="panel-group">
        <el-col
          v-for="(folder, idx) in local_folderLs"
          v-show="hideFolder()"
          :key="idx"
          :xs="12"
          :sm="12"
          :lg="6"
          class="card-panel-col"
          @drop.native="drog($event, folder.folder_name)"
          @dragover.prevent
          @click.native="openFolder(folder)"
        >
          <div
            class="card-panel"
            style="margin: 10px;"
            @mouseenter="enterFolder(folder)"
            @mouseleave="leaveFolder(folder)"
          >
            <div class="card-panel-icon-wrapper icon-clipboard">
              <!--                    <svg-icon icon-class="clipboard" class-name="card-panel-icon" />-->
              <svg-icon icon-class="folder" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description" style="position: absolute;left: 120px;top: auto">
              <div class="card-panel-text">{{ folder.folder_name }}</div>
              <div class="card-panel-num">文件夹</div>
              <div class="card-panel-num">{{ folder.date }}</div>
            </div>
            <transition name="slide-fade">
              <div
                v-if="show && showCurrent === folder.folder_name"
                style="position: absolute;right: 0;margin: 13px 20px;"
              >
                <div style="margin-bottom: 5px;">
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-edit"
                    circle
                    @click.stop="editFolder(folder)"
                  />
                </div>
                <div>
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    @click.stop="deleteFolder(folder)"
                  />
                </div>
              </div>
            </transition>
          </div>
        </el-col>

        <el-col
          v-for="item in (searchProjectLs.length ? searchProjectLs : projectLs)"
          v-show="changeStatus(item.project_name)"
          :key="item.project_name"
          :xs="12"
          :sm="12"
          :lg="6"
          class="card-panel-col"
          draggable="true"
          @click.native="item.json ? handleSetLineChartData(item) : ''"
          @dragstart.native="dragstart($event, item.project_name)"
          @dragend.native="dragend($event)"
        >
          <div
            class="card-panel"
            style="margin: 10px;"
            @mouseenter="item.json ? enter(item) : ''"
            @mouseleave="item.json ? leave(item) : ''"
          >
            <el-progress
              v-if="item.isDownloading"
              type="circle"
              :percentage="item.downloadRate"
              :width="50"
              :stroke-width="3"
              class="progress"
            />
            <div
              v-if="item.isDownloading"
              :style="{ filter: 'blur(' + (100 - item.downloadRate) / 10 + 'px) contrast(0.8)' }"
            >
              <div class="card-panel-icon-wrapper icon-clipboard">
                <svg-icon icon-class="clipboard" class-name="card-panel-icon" />
              </div>
              <div class="card-panel-description" style="position: absolute;left: 120px;">
                <div class="card-panel-text">{{ item.project_name }}</div>
                <div
                  class="card-panel-num"
                >{{ item.project_type ? (item.project_type == 'cloud' ? '云端' : '本地') : "" }}</div>
                <div class="card-panel-num">{{ item.date }}</div>
              </div>
            </div>
            <div v-if="!item.isDownloading">
              <div class="card-panel-icon-wrapper icon-clipboard">
                <svg-icon icon-class="clipboard" class-name="card-panel-icon" />
              </div>
              <div class="card-panel-description" style="position: absolute;left: 120px;">
                <div class="card-panel-text">{{ item.project_name }}</div>
                <div
                  class="card-panel-num"
                >{{ item.project_type ? (item.project_type == 'cloud' ? '云端' : '本地') : "" }}</div>
                <div class="card-panel-num">{{ item.date }}</div>
              </div>
            </div>
            <transition name="slide-fade">
              <div
                v-if="show && showCurrent === item.project_name"
                style="position: absolute;right: 0;margin: 13px 20px;"
              >
                <div style="margin-bottom: 5px;">
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-edit"
                    circle
                    @click.stop="editClick(item)"
                  />
                </div>
                <div style="margin-bottom: 5px;">
                  <el-button
                    size="mini"
                    type="success"
                    icon="el-icon-download"
                    circle
                    @click.stop="download(item)"
                  />
                </div>
                <div>
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    @click.stop="deleteProject(item)"
                  />
                </div>
              </div>
            </transition>
          </div>
        </el-col>
      </el-row>
    </div>
    <div
      v-if="currentTab === '项目列表'"
      class="welcome-container"
      style="position: absolute;width: 100%;top: 259px;padding: 0 20px 20px 20px;background: #eeeeee;"
    >
      <el-table border :data="(searchProjectLs.length ? searchProjectLs : projectLs)">
        <el-table-column
          prop="project_name"
          align="center"
          label="项目名称"
          min-width="100px"
          show-overflow-tooltip
        />
        <el-table-column prop="json.cron" align="center" label="执行规则" />
        <el-table-column prop="json.retry_count" align="center" label="重试次数" />
        <el-table-column prop="json.retry_interval" align="center" label="重试间隔(毫秒)" />
        <el-table-column prop="json.time_out" align="center" label="超时时间(毫秒)" />
        <el-table-column prop="date" align="center" label="日期" />
        <el-table-column
          fixed="right"
          align="center"
          label="操作"
          width="300"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="editClick(scope.row)">编辑</el-button>
            <el-button type="success" size="mini" @click="handleSetLineChartData(scope.row)">查看</el-button>
            <el-button type="info" size="mini" @click="download(scope.row)">导出</el-button>
            <el-button type="danger" size="mini" @click="deleteProject(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      title="新建项目"
      :visible.sync="showDialog"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form label-position="left" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="projectName" max="100" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="description" type="textarea" :rows="8" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div style="margin-top: 30px;">
        <el-button
          type="primary"
          style="width: 70px;height: 32px;line-height: 7px;"
          @click="commitHandleClick()"
        >确定</el-button>
        <el-button
          style="width: 70px;height: 32px;line-height: 7px;color: #1890ff;border: 1px solid #1890ff;"
          @click="cancelClick()"
        >取消</el-button>
      </div>
    </el-dialog>
    <folder ref="childFolder" />
    <edit ref="editForm" />
  </div>
</template>

<script>
const JSZIP = require("jszip");
const async = require("async");
const fs = window.require("fs");
const os = window.require("os");
const path = window.require("path");
const fse = window.require("fs-extra");
const decompress = window.require("decompress");
const app = window.require("electron").remote.app;
const ipc = window.require("electron").ipcRenderer;
const { fileSelector } = require("@/utils/electron.js");
const { pluginDownload } = require("@/utils/electron.js");
const {
  getSynchronizeParams,
  downloadDemo
} = require("@/utils/synchronizeProject.js");
const { execute } = window.require(path.resolve() + "/public/runner/index.js");
import _ from "lodash";
import moment from "moment";
import environment from "@/config/environment";
import config from "@/config/environment/index";
import edit from "./components/edit";
import folder from "./components/folder";
import { getCloudProjects, pluginViews } from "@/api/plugin";

const express_app = require("../../express/app");
express_app.start_server();

document.ondragover = function(e) {
  e.preventDefault();
};
document.ondrop = function(e) {
  e.preventDefault();
};

export default {
  name: "Workspace",
  components: {
    edit,
    folder
  },
  data() {
    return {
      activeName: "项目宫格",
      currentTab: "项目宫格",
      isShowCreate: true,
      search: "",
      showSearch: false,
      show: false,
      showTip: config.projectsPath === "",
      showCurrent: "",
      projectName: "",
      description: "",
      projects_path: "",
      showDialog: false,
      projectList: [],
      uploadLoading: false,
      filePath: "",
      dialogSelectVisible: false,
      cronExpression: "",
      webPlugins_global: [],
      searchProjectLs: [],
      currentFolderName: ""
    };
  },
  computed: {
    vuex_download_projectLs() {
      return this.$store.state.project.projectDownload;
    },
    vuex_local_projectLs() {
      return this.$store.state.project.localProjectLs;
    },
    local_projectLs() {
      var arr = [];
      for (const i in this.vuex_local_projectLs) {
        arr.push(this.vuex_local_projectLs[i]);
      }
      return arr;
    },
    download_projectLs() {
      var arr = [];
      for (const i in this.vuex_download_projectLs) {
        arr.push(this.vuex_download_projectLs[i]);
      }
      return arr;
    },
    projectLs() {
      return _.concat(this.local_projectLs, this.download_projectLs);
    },
    vuex_local_folderLs() {
      return this.$store.state.project.localProjectFoldersLs;
    },
    local_folderLs() {
      var arr = [];
      for (const i in this.vuex_local_folderLs) {
        arr.push(this.vuex_local_folderLs[i]);
      }
      return arr;
    },
    local_folder_projects() {
      var arr = [];
      var projects = "";
      for (const i in this.vuex_local_folderLs) {
        projects = this.vuex_local_folderLs[i].projects;
        arr = _.concat(arr, projects);
      }
      return arr;
    }
  },
  created() {},
  mounted() {
    window.addEventListener("scroll", this.scrollFn, true);
    this.getProjectList();
    this.pluginViewsFn().then(result => {
      this.webPlugins_global = result;

      if (!fs.existsSync(`${config.pluginsPath}/base`)) {
        let target = _.find(this.webPlugins_global, { plugin_id: "base" });
        if (target) {
          pluginDownload({
            plugin: target,
            listener_name:
              "downstate" + target.plugin_id + "@" + target.version,
            downloadPath:
              environment.serverUrl +
              "/downloads/plugins/" +
              target.plugin_id +
              "/" +
              target.plugin_id +
              "@" +
              target.version,
            configPath: path.normalize(
              config.pluginsPath + "/.." + "/plugins_temp/"
            )
          });
        }
      }
    });
  },
  destroyed() {
    window.removeEventListener("scroll", this.scrollFn, true);
  },
  methods: {
    scrollFn(event) {
      let self = this;
      if (self.getScroll().top < 259) {
        self.isShowCreate = true;
        document.getElementById("navbar").classList.remove("s_down");
      } else {
        self.isShowCreate = false;
        document.getElementById("navbar").classList.add("s_down");
        document.getElementById("navbar").style.top =
          378 - self.getScroll().top > 0
            ? `${-(378 - self.getScroll().top)}px`
            : 0;
      }
    },
    // 页面滑动事件
    getScroll() {
      var top, left, width, height;
      if (document.documentElement && document.documentElement.scrollTop) {
        top = document.documentElement.scrollTop;
        left = document.documentElement.scrollLeft;
        width = document.documentElement.scrollWidth;
        height = document.documentElement.scrollHeight;
      } else if (document.body) {
        top = document.body.scrollTop;
        left = document.body.scrollLeft;
        width = document.body.scrollWidth;
        height = document.body.scrollHeight;
      }
      return { top: top, left: left, width: width, height: height };
    },
    // tab切换
    handleTabClick(tab, event) {
      if (_.includes(["项目宫格", "项目列表"], tab.label)) {
        this.currentTab = tab.label;
      } else if (tab.label == "新建项目") {
        this.showDialog = true;
      } else if (tab.label == "新建文件夹") {
        this.createFolder();
      }
    },
    // tab切换阻断
    beforeLeave(item) {
      if (_.includes(["项目宫格", "项目列表"], item)) {
        return true;
      } else {
        return false;
      }
    },
    addProject(projectItem) {
      let json = fse.readJsonSync(
        `${this.projects_path}/${projectItem}/${projectItem}.json`
      );
      const initialStatus = {
        project_name: projectItem,
        project_type: json.project_type || "",
        json: json,
        date: moment(json.updateAt).format("YYYY-MM-DD")
      };
      this.$store.commit("project/LOCAL_PROJECT", initialStatus);
    },
    getProjectList() {
      const self = this;
      if (config.projectsPath) {
        // 插件目录
        this.projects_path = config.projectsPath + "/";
        let projectsPathLs = [];

        const files = _.difference(fs.readdirSync(`${this.projects_path}`), [
          ".DS_Store"
        ]);
        files.forEach(function(fileName, index) {
          const file = fs.statSync(self.projects_path + "/" + fileName);
          if (file.isDirectory()) {
            let json = fse.readJsonSync(
              `${self.projects_path}/${fileName}/${fileName}.json`
            );
            if (json.project_type !== "folder") {
              projectsPathLs.push(fileName);
            }
          }
        });

        this.projectList = _.each(projectsPathLs, (projectItem, idx) => {
          this.addProject(projectItem);
        });
      }
    },
    // 鼠标进入事件
    enter(el) {
      this.show = true;
      this.showCurrent = el.project_name;
    },
    // 鼠标离开事件
    leave(el) {
      this.show = false;
      this.showCurrent = "";
    },
    // 取消按钮
    cancelClick() {
      this.projectName = "";
      this.description = "";
      this.showDialog = false;
    },
    message(msg, type) {
      this.$message({
        message: msg,
        type: type
      });
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
      const self = this;
      if (!config.projectsPath) {
        this.message("请先到系统管理设置项目路径", "warning");
      } else if (!this.projectName.trim()) {
        this.message("项目名称不能为空", "warning");
      } else {
        this.projectName = this.projectName
          .replace(/\//g, "")
          .replace(/\\/g, "");
        let isFile = fs.existsSync(
          `${this.projects_path}${this.projectName}/${this.projectName}.json`
        );
        if (isFile) {
          let json = fse.readJsonSync(
            `${this.projects_path}${this.projectName}/${this.projectName}.json`
          );
          if (json.project_type === "folder") {
            this.message(
              `'${this.projectName}'项目名称被文件夹名称占用，请更换项目名称后重试！`,
              "warning"
            );
          } else {
            this.$confirm("文件已存在, 是否打开该文件?", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }).then(() => {
              this.$router.push({
                path: "/project",
                query: {
                  currentProjectName: "",
                  currentProjectType: "",
                  redirectProjectName: this.projectName,
                  redirectProjectType: "local",
                  plugins: this.webPlugins_global
                }
              });
            });
          }
        } else {
          if (
            !_.includes(
              _.difference(fs.readdirSync(config.pluginsPath), [".DS_Store"]),
              "base"
            )
          ) {
            return this.$message("请先下载通用组件", "error");
          } else {
            const versionLs = _.difference(
              fs.readdirSync(`${config.pluginsPath}/base`),
              [".DS_Store"]
            ).sort(this.versionFn);
            if (!fs.existsSync(`${this.projects_path}${this.projectName}`)) {
              fse.ensureDirSync(`${this.projects_path}${this.projectName}`);
              let writeJson = _.extend(
                { project_name: this.projectName },
                { project_type: "local" },
                { createAt: moment().format("YYYY-MM-DD HH:mm:ss") },
                { updateAt: moment().format("YYYY-MM-DD HH:mm:ss") },
                { cron: "" },
                { retry_count: "" },
                { retry_interval: "" },
                { time_out: "" },
                { description: this.description },
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
                          name: "重试次数"
                        },
                        {
                          id: "retry_interval",
                          value: "50",
                          name: "重试时间间隔(ms)"
                        },
                        {
                          id: "execution_timeout",
                          value: "5000",
                          name: "执行超时时间(ms)"
                        },
                        {
                          id: "delayed_execution_time",
                          value: "50",
                          name: "延迟执行时间(ms)"
                        },
                        {
                          id: "waiting_time_after_execution",
                          value: "50",
                          name: "执行后等待时间"
                        }
                      ]
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
                      y: 479,
                      id: "9e189b9d",
                      index: 1,
                      general_property: [
                        {
                          id: "retry_count",
                          value: "1",
                          name: "重试次数"
                        },
                        {
                          id: "retry_interval",
                          value: "50",
                          name: "重试时间间隔(ms)"
                        },
                        {
                          id: "execution_timeout",
                          value: "5000",
                          name: "执行超时时间(ms)"
                        },
                        {
                          id: "delayed_execution_time",
                          value: "50",
                          name: "延迟执行时间(ms)"
                        },
                        {
                          id: "waiting_time_after_execution",
                          value: "50",
                          name: "执行后等待时间"
                        }
                      ]
                    }
                  ]
                }
              );
              fse.writeJsonSync(
                `${this.projects_path}${this.projectName}/${this.projectName}.json`,
                writeJson,
                "utf8"
              );
            }
            if (this.currentFolderName) {
              this.$store.commit("project/LOCAL_PROJECT_FOLDER_DELETE", {
                folder_name: this.currentFolderName
              });
              let json = fse.readJsonSync(
                `${config.projectsPath}/${this.currentFolderName}/${this.currentFolderName}.json`
              );
              json.projects = _.concat(json.projects, this.projectName);
              json.updateAt = moment().format("YYYY-MM-DD HH:mm:ss");
              fse.writeFileSync(
                `${config.projectsPath}/${this.currentFolderName}/${this.currentFolderName}.json`,
                JSON.stringify(json, null, "\t"),
                "utf8"
              );
              const data = {
                folder_name: this.currentFolderName,
                project_type: json.project_type || "folder",
                projects: json.projects || [],
                json: json,
                date: moment(json.updateAt).format("YYYY-MM-DD")
              };
              this.$store.commit("project/LOCAL_PROJECT_FOLDERS", data);
              this.$refs["childFolder"].showOpenFolder = false;
            }
            this.$router.push({
              path: "/project",
              query: {
                currentProjectName: "",
                currentProjectType: "",
                redirectProjectName: this.projectName,
                redirectProjectType: "local",
                plugins: this.webPlugins_global
              }
            });
            this.showDialog = false;
          }
        }
      }
    },
    handleSetLineChartData(val) {
      if (!val.isDownloading) {
        this.$router.push({
          path: "/project",
          query: {
            currentProjectName: "",
            currentProjectType: "",
            redirectProjectName: val.project_name,
            redirectProjectType: val.project_type,
            plugins: this.webPlugins_global
          }
        });
      } else {
        this.$message({
          type: "warning",
          message: "该项目暂无法操作"
        });
      }
    },
    // 运行
    run(projectName) {
      execute(projectName);
    },
    // 编辑
    editClick(params) {
      if (!params.isDownloading) {
        this.$refs["editForm"] && this.$refs["editForm"].show(params);
      } else {
        this.$message({
          type: "warning",
          message: "该项目暂无法操作"
        });
      }
    },
    // 压缩项目文件
    download(params) {
      if (!params.isDownloading) {
        const self = this;
        const zip = new JSZIP();
        var readJson = fse.readJsonSync(
          `${this.projects_path}/${params.project_name}/${params.project_name}.json`
        );
        readJson.project_type = "cloud";

        fse.writeFileSync(
          `${this.projects_path}${params.project_name}/${params.project_name}.json`,
          JSON.stringify(readJson, null, "\t"),
          "utf8"
        );
        let targetDir = `${this.projects_path}${params.project_name}`;

        const target = zip.folder(params.project_name);
        this.readDir(target, targetDir);
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
            zip.remove(params.project_name);
            if (!fs.existsSync(self.projects_path + "../zip/")) {
              fse.ensureDirSync(self.projects_path + "../zip/");
            }
            fs.writeFileSync(
              self.projects_path + "../zip/" + params.project_name + ".zip",
              content,
              "utf-8"
            ); // 将打包的内容写入zip中
            self.$message({
              message: `项目导出成功，导出路径：${path.normalize(
                self.projects_path + "../zip/" + params.project_name + ".zip"
              )}`,
              type: "success"
            });

            const readJson = fse.readJsonSync(
              `${self.projects_path}/${params.project_name}/${params.project_name}.json`
            );
            readJson.project_type = "local";

            fse.writeFileSync(
              `${self.projects_path}${params.project_name}/${params.project_name}.json`,
              JSON.stringify(readJson, null, "\t"),
              "utf8"
            );
          });
      } else {
        this.$message({
          type: "warning",
          message: "该项目暂无法操作"
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
    // 导入项目
    exportProject() {
      var self = this;
      fileSelector({ properties: ["openFile"] }).then(result => {
        if (Array.isArray(result)) {
          self.filePath = result[0];
        }
      });
    },
    // 导入事件
    upload() {
      const self = this;
      if (!config.projectsPath) {
        this.message("请先到系统管理设置项目路径", "warning");
        return;
      }
      this.dialogSelectVisible = false;
      this.uploadLoading = true;
      if (
        this.filePath.split(".")[this.filePath.split(".").length - 1] !== "zip"
      ) {
        this.uploadLoading = false;
        self.$message({
          type: "error",
          message: "文件格式错误"
        });
        return;
      }

      var targetPathCut = this.filePath.replace(/\\/g, "/").split("/");
      var projectName = targetPathCut[targetPathCut.length - 1].split(
        ".zip"
      )[0];

      var projectTempPath = `${config.projectsPath}/../projects_temp/${projectName}`;
      var projectsPath = config.projectsPath + "/";

      if (!fs.existsSync(projectTempPath)) {
        fse.ensureDirSync(projectTempPath);
      }
      if (!fs.existsSync(projectsPath)) {
        fse.ensureDirSync(projectsPath);
      }

      decompress(this.filePath, projectTempPath, {
        filter: function(file) {
          var r = true;
          if (file.path.startsWith("__MACOSX")) {
            r = false;
          }
          return r;
        }
      })
        .then(files => {
          if (files && files.length) {
            const file = _.find(files, {
              path: `${projectName}/${projectName}.json`
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
                self.$message({
                  type: "error",
                  message: "包内文件不合法，请检查包内容后再试!"
                });
              } else {
                // 导入项目里所需要的插件
                const projectPlugins = _.uniq(
                  _.map(readJson.nodes, "plugin_id")
                );
                // 本地系统里所有插件
                const localPlugins = _.difference(
                  fs.readdirSync(config.pluginsPath + "/"),
                  ["list.json"]
                );
                // 云端所有插件
                const webPlugins = _.map(this.webPlugins_global, "plugin_id");
                // 需要从云端下载的插件
                const downPlugins = _.difference(projectPlugins, localPlugins);
                // 检查是否已存在该项目 -->  将存放在临时文件夹的项目转移进项目库
                const downloadPlugin = function() {
                  self.uploadLoading = false;
                  var cloneProjectTempPath = _.cloneDeep(projectTempPath);
                  files[0].type === "directory" &&
                    (cloneProjectTempPath =
                      cloneProjectTempPath + "/" + files[0].path);
                  if (
                    fs.existsSync(
                      projectsPath + projectName + "/" + projectName + ".json"
                    )
                  ) {
                    self
                      .$confirm("导入的项目已存在, 是否更新替换?", "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning"
                      })
                      .then(() => {
                        self.$message({
                          type: "success",
                          message: "更新成功!"
                        });
                      });
                  } else {
                    self.filePath = "";
                    self.$message({
                      type: "success",
                      message: "导入成功!"
                    });
                  }
                  readJson.project_type = "local";
                  fs.writeFileSync(
                    `${cloneProjectTempPath}/${projectName}.json`,
                    JSON.stringify(readJson, null, "\t"),
                    "utf8"
                  );
                  fse.moveSync(
                    cloneProjectTempPath,
                    projectsPath + projectName,
                    {
                      overwrite: true
                    }
                  );
                  fse.emptyDirSync(cloneProjectTempPath);
                  try {
                    fs.rmdirSync(cloneProjectTempPath);
                    fs.rmdirSync(projectTempPath);
                  } catch (error) {}
                  self.addProject(projectName);
                };
                if (downPlugins.length) {
                  // 需要从云端下载的插件  本地不存在 && 云端不存在
                  const abnormalPlugins = _.difference(downPlugins, webPlugins);
                  if (abnormalPlugins.length) {
                    self
                      .$confirm(
                        `检测到${abnormalPlugins}插件本地且云端不存在，是否继续导入项目？`,
                        "提示",
                        {
                          confirmButtonText: "是",
                          cancelButtonText: "否",
                          type: "warning"
                        }
                      )
                      .then(() => {
                        downloadPlugin();
                      });
                  } else {
                    // 需要从云端下载的插件  本地不存在 && 云端存在
                    const targetDownPlugins = [];
                    _.each(this.webPlugins_global, webPlugin => {
                      _.each(downPlugins, downPlugin => {
                        if (webPlugin.plugin_id == downPlugin) {
                          targetDownPlugins.push(webPlugin);
                        }
                      });
                    });
                    this.pluginDownloadFn(targetDownPlugins).then(res => {
                      downloadPlugin();
                    });
                  }
                } else {
                  downloadPlugin();
                }
              }
            } else {
              self.filePath = "";
              self.uploadLoading = false;
              self.$message({
                type: "error",
                message: "zip包名与包内项目名不匹配!"
              });
            }
          }
        })
        .catch(err => {
          console.error(err);
          self.uploadLoading = false;
          self.$message({
            type: "error",
            message: "文件解压失败"
          });
        });
    },
    // 获取云端插件
    pluginViewsFn() {
      return new Promise((resolve, reject) => {
        pluginViews({
          attributes: ["plugin_id", "version", "attachment_md5"]
        })
          .then(result => {
            resolve(result.data);
          })
          .catch(err => {
            console.error(err);
            reject();
          });
      });
    },
    // 下载插件
    pluginDownloadFn(targetDownPlugins) {
      return new Promise((resolve, reject) => {
        async.mapSeries(
          targetDownPlugins,
          (plugin, cb) => {
            // 下载插件
            pluginDownload({
              plugin: plugin,
              listener_name:
                "downstate" + plugin.plugin_id + "@" + plugin.version,
              downloadPath:
                environment.serverUrl +
                "/downloads/plugins/" +
                plugin.plugin_id +
                "/" +
                plugin.plugin_id +
                "@" +
                plugin.version,
              configPath: path.normalize(
                config.pluginsPath + "/.." + "/plugins_temp/"
              )
            })
              .then(result => {
                this.$store
                  .dispatch("plugin/pluginDownloadDelete", plugin.plugin_id)
                  .then(pluginDownloadDelete => {
                    const thePluginStatus = {
                      plugin_id: plugin.plugin_id,
                      needUpdate: false,
                      buttonText: "已安装最新版本"
                    };
                    this.$store
                      .dispatch("plugin/pluginStatus", thePluginStatus)
                      .then(pluginStatus => {});
                  });
                cb(null, result);
              })
              .catch(err => {
                console.error(err);
                const thePluginStatus = {
                  plugin_id: plugin.plugin_id,
                  needUpdate: true,
                  buttonText: "重新下载"
                };
                this.$store.dispatch("plugin/pluginStatus", thePluginStatus);
                cb(err, null);
              });
          },
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          }
        );
      });
    },
    // 删除项目
    deleteProject(item) {
      if (!item.isDownloading) {
        this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.delDir(this.projects_path + item.project_name);
            this.$message({
              type: "success",
              message: "删除成功"
            });
            this.$store.commit("project/LOCAL_PROJECT_DELETE", item);
            if (this.$refs["childFolder"].showOpenFolder) {
              this.$store.commit("project/LOCAL_PROJECT_FOLDER_DELETE", {
                folder_name: this.$refs["childFolder"].tempFolderName
              });
              let json = fse.readJsonSync(
                `${config.projectsPath}/${this.$refs["childFolder"].tempFolderName}/${this.$refs["childFolder"].tempFolderName}.json`
              );
              const index = _.findIndex(json["projects"], function(element) {
                return element === item.project_name;
              });
              if (index !== -1) {
                _.pull(json["projects"], item.project_name);
              }
              json.updateAt = moment().format("YYYY-MM-DD HH:mm:ss");
              fse.writeFileSync(
                `${config.projectsPath}/${this.$refs["childFolder"].tempFolderName}/${this.$refs["childFolder"].tempFolderName}.json`,
                JSON.stringify(json, null, "\t"),
                "utf8"
              );
              const data = {
                folder_name: this.$refs["childFolder"].tempFolderName,
                project_type: json.project_type || "folder",
                projects: json.projects || [],
                json: json,
                date: moment(json.updateAt).format("YYYY-MM-DD")
              };
              this.$store.commit("project/LOCAL_PROJECT_FOLDERS", data);
            }
            this.$refs["childFolder"].showOpenFolder = false;
          })
          .catch(err => {
            console.log(err);
            this.$message({
              type: `${err === "cancel" ? "info" : "error"}`,
              message: `${
                err === "cancel" ? "已取消删除" : "文件被占用，请稍后再试"
              }`
            });
          });
      } else {
        this.$message({
          type: "warning",
          message: "该项目暂无法操作"
        });
      }
    },
    // 删除文件夹
    delDir(path) {
      let files = [];
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
          const curPath = path + "/" + file;
          if (fs.statSync(curPath).isDirectory()) {
            this.delDir(curPath); // 递归删除文件夹
          } else {
            fs.unlinkSync(curPath); // 删除文件
          }
        });
        fs.rmdirSync(path);
      }
    },
    // 点击搜索图标事件
    searchClick() {
      this.showSearch = !this.showSearch;
      if (this.showSearch) {
        this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.focus();
      }
    },
    // 搜索
    searchFn() {
      this.searchProjectLs = [];
      const searchName = this.search.replace(/\s+/g, "");
      if (searchName.length) {
        _.each(this.projectLs, (item, idx) => {
          if (item.project_name.indexOf(searchName) > -1) {
            this.searchProjectLs.push(item);
          }
        });
      }
      if (!this.searchProjectLs.length) {
        this.$message({
          type: "warning",
          message: "找不到该项目"
        });
      }
    },
    // 同步项目
    syncProject() {
      const deviceId = fse.readJsonSync(`${os.homedir()}/.uiauto/uiauto.conf`)
        .deviceId;
      if (deviceId) {
        getCloudProjects({
          deviceId: deviceId
        }).then(getCloudProjectsRes => {
          if (getCloudProjectsRes.data.length) {
            getSynchronizeParams(getCloudProjectsRes.data);
          }
        });
      } else {
        this.$message({
          type: "warning",
          message: "获取机器码失败，请联系管理员"
        });
      }
    },
    createFolder() {
      this.$refs["childFolder"].createFolder();
    },
    enterFolder(folder) {
      try {
        this.$refs["childFolder"].enterFolder(folder);
      } catch (e) {
        console.log(e);
      }
    },
    leaveFolder(folder) {
      try {
        this.$refs["childFolder"].leaveFolder(folder);
      } catch (e) {
        console.log(e);
      }
    },
    editFolder(folder) {
      this.$refs["childFolder"].editFolder(folder);
    },
    deleteFolder(folder) {
      this.$refs["childFolder"].deleteFolder(folder);
    },
    drog(event, folder_name) {
      this.$refs["childFolder"].drog(event, folder_name);
    },
    dragstart(event, project_name) {
      this.$refs["childFolder"].dragstart(event, project_name);
    },
    dragend(event) {
      this.$refs["childFolder"].dragend(event);
    },
    changeStatus(project_name) {
      const searchProjects = this.searchProjectLs;
      if (searchProjects.length) {
        var searchIndex = _.findIndex(searchProjects, function(e) {
          return e.project_name === project_name;
        });
        if (searchIndex !== -1) {
          return true;
        }
      }
      const folderProjects = this.local_folder_projects;
      var index = _.findIndex(folderProjects, function(e) {
        return e === project_name;
      });
      return index === -1;
    },
    openFolder(folder) {
      this.currentFolderName = folder.folder_name;
      this.$refs["childFolder"].openFolder(folder);
    },
    outFolder(params) {
      this.$refs["childFolder"].outFolder(params);
    },
    hideFolder() {
      return !this.searchProjectLs.length;
    },
    cancelFolder() {
      this.currentFolderName = "";
    },
    // 下载示例
    downloadDemoFn() {
      if (fs.existsSync(`${config.projectsPath}/示例项目`)) {
        this.$message({
          type: "warning",
          message: "您本地已存在示例项目，无需重复下载！"
        });
      } else {
        downloadDemo(`${config.serverUrl}/src/files/示例项目.zip`)
          .then(res => {
            this.getProjectList();
            this.$refs["childFolder"].getFolderList();
            this.$message({
              type: "success",
              message: "成功下载示例项目"
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-dialog {
  margin-top: 18vh !important;
  font-size: 14px;
  font-weight: bold;
  width: 31%;
  border-radius: 10px;
}

/deep/ .el-dialog__body {
  text-align: center;
}

/deep/ .el-tabs--border-card {
  width: calc(100% - 20px);
  border: none;
  box-shadow: none;
  background: transparent;
}

/deep/ .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}

/deep/ .el-tabs__nav {
  float: right;
}

/deep/ .el-input__inner {
  height: 32px;
}

.s_down {
  position: fixed;
  width: calc(100% - 60px);
  z-index: 100;
}

.navbar {
  height: 40px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .left-menu {
    float: left;
    height: 100%;
    line-height: 40px;
    font-size: 14px;
    margin-left: 15px;
  }

  .header-search {
    float: right;
    font-size: 0 !important;
    line-height: 40px;

    .search-icon {
      cursor: pointer;
      font-size: 18px;
      margin-bottom: 5px;
      vertical-align: middle;
    }

    .header-search-select {
      font-size: 14px;
      margin-bottom: 5px;
      transition: width 0.2s;
      width: 0;
      overflow: hidden;
      background: transparent;
      border-radius: 0;
      display: inline-block;
      vertical-align: middle;

      /deep/ .el-input__inner {
        border-radius: 0;
        border: 0;
        padding-left: 0;
        padding-right: 0;
        box-shadow: none !important;
        border-bottom: 1px solid #050505;
        vertical-align: middle;
      }
    }

    &.showSearch {
      .header-search-select {
        width: 210px;
        margin-left: 10px;
      }
    }
  }
}

.slide-fade-enter-active {
  transition: all 0.8s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */
 {
  transform: translateX(10px);
  opacity: 0;
}

.welcome-container {
  padding: 20px 0 20px 20px;

  textarea:focus {
    outline: none;
  }

  .panel-group {
    width: 100%;
    height: 100%;

    .card-panel-col-created {
      margin-bottom: 0;
      padding-right: 0 !important;
    }

    .card-panel-col {
      padding-right: 0 !important;
    }

    .card-panel {
      height: 120px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #999999;
      background: #fff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.05);
      border-radius: 4px;

      &:hover {
        .card-panel-icon-wrapper {
          color: #fff;
        }

        .icon-edit {
          background: #40c9c6;
        }

        .icon-clipboard {
          background: #36a3f7;
        }

        .icon-close {
          background: #f4516c;
        }
      }

      .icon-edit {
        color: #40c9c6;
      }

      .icon-clipboard {
        color: #36a3f7;
      }

      .icon-close {
        color: #f4516c;
      }

      .card-panel-icon-wrapper {
        float: left;
        margin: 20px 20px 20px 30px;
        padding: 16px;
        //   transition: all 0.38s ease-out;
        border-radius: 6px;
      }

      .card-panel-icon {
        float: left;
        font-size: 48px;
      }

      .card-panel-description {
        width: calc(100% - 130px);
        font-weight: bold;
        margin: 26px;
        margin-left: 0px;

        .card-panel-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 18px;
          color: #454545;
          font-size: 16px;
          margin-bottom: 6px;
        }

        .card-panel-num {
          margin-bottom: 6px;
          font-size: 14px;
        }
      }
    }
  }

  .title-name {
    color: #333333;
    vertical-align: sub;
  }
}

.progress {
  position: absolute;
  margin: 35px calc((100% - 50px) / 2);
}
</style>
