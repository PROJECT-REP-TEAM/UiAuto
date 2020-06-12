<!--
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-08-14 09:59:03
 * @LastEditTime: 2019-08-28 14:01:28
 * @Description: file content
 -->
<template>
  <div class="app-main-content" style="margin: 10px;background: #fff;">
    <div class="filter-container">
      <el-row>
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8" class="advanced-search-groups">
          插件名称/描述：
          <el-input
            v-model.trim="searchName"
            placeholder="插件名称"
            style="width: 200px;"
            class="filter-item"
            clearable
            @keyup.enter.native="handleSeach()"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" class="advanced-search-groups">
          插件状态：
          <el-select
            v-model="searchStatus"
            class="filter-item"
            placeholder="插件状态"
            @change="handleFilterInit()"
          >
            <el-option label="全部" value="全部" />
            <el-option v-if="tabName !== 'local'" label="下载" value="下载" />
            <el-option label="更新" value="更新" />
          </el-select>
        </el-col>
        <el-col
          align="right"
          :xs="24"
          :sm="24"
          :md="24"
          :lg="24"
          :xl="24"
          class="advanced-search-operations"
        >
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜索</el-button>
        </el-col>
      </el-row>
    </div>

    <div v-loading="loading" element-loading-background="#FFFFFF" style="height: 100%">
      <div style="position: relative;display: inline-block;width: 100%;">
        <div
          v-for="plugin in list"
          :key="plugin.plugin_id"
          :id="plugin.plugin_id"
          class="card-panel"
          style="margin-top: 1%;width: 48.5%;float: left;margin-left: 1%;height: 180px;"
        >
          <el-card :body-style="{ padding: '0px', height: '100%' }" shadow="never">
            <svg
              v-if="plugin.language==='nodejs'"
              style="float:right;margin:14px 10px 0px 0px;"
              t="1565963200375"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="4393"
              width="46"
              height="46"
            >
              <path
                d="M875.2 262.3L546.7 72.7c-20.7-11.8-48.3-11.8-69 0L148.8 262.3c-21.5 12.2-34.5 34.9-34.5 59.7v379.2c0 24.8 13.4 47.9 34.5 60.1l86.1 49.5c41.8 20.7 56.8 20.7 75.9 20.7 62.1 0 97.4-37.8 97.4-102.7V354.4c0-5.3-4.1-9.3-9.3-9.3h-41.4c-5.3 0-9.3 4.1-9.3 9.3v374.3c0 28.8-30 57.7-78.8 33.3l-90.1-52c-3.2-2-5.3-5.3-5.3-8.9V321.9c0-3.7 2-7.3 5.3-8.9l328.1-190c3.2-1.6 7.3-1.6 10.2 0l328.5 189.6c3.2 1.6 5.3 5.3 5.3 8.9v379.2c0 3.7-2 7.3-4.9 8.9L517.9 899.3c-2.8 1.6-7.3 1.6-10.2 0l-84.4-49.9c-2.4-1.2-5.7-1.6-8.1-0.4-23.1 13.4-27.6 15-49.5 22.7-5.7 1.6-13.4 4.9 2.8 14.2l109.6 65c10.6 6.1 22.3 9.3 34.5 9.3 11.8-0.4 24-3.2 34.1-9.7l328.5-189.6c21.1-12.2 34.5-34.9 34.5-59.7V321.9c0-24.3-13.4-47.5-34.5-59.6z"
                fill="#689F63"
                p-id="4394"
              />
              <path
                d="M614.1 641.1c-86.9 0-106-21.9-112.5-65-0.8-4.9-4.5-8.1-9.3-8.1h-42.6c-5.3 0-9.3 4.1-9.3 9.3 0 55.2 30 121.4 173.8 121.4l-0.4-0.4c103.9 0 163.6-41 163.6-112.5 0-70.6-47.9-89.7-149-103.1-101.9-13.4-112.5-20.3-112.5-44.3 0-19.5 8.9-45.9 84.4-45.9 67.8 0 92.6 14.6 102.7 60.1 1.2 4.1 4.9 7.3 9.3 7.3H755c2.4 0 5.3-0.8 6.9-2.8 1.6-2 2.8-4.5 2.4-7.3-6.9-78.4-58.9-114.9-164-114.9-93.4 0-149.4 39.4-149.4 105.6 0 71.9 55.6 91.8 145.8 100.7 107.6 10.6 116.1 26.4 116.1 47.5 0 36.5-29.3 52.4-98.7 52.4z"
                fill="#689F63"
                p-id="4395"
              />
            </svg>
            <svg
              v-if="plugin.language==='python'"
              style="float:right;margin:14px 10px 0 0"
              t="1565963546363"
              class="icon"
              viewBox="0 0 1029 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="5140"
              width="40"
              height="40"
            >
              <path
                d="M610.304 7.68l38.4 8.704 31.232 11.264 25.088 12.8 19.456 13.824 14.336 14.336 10.752 14.336 6.656 14.336 4.096 12.8 1.536 11.264 1.024 8.704-0.512 5.632v227.84l-2.048 26.624-5.632 23.552-9.216 19.456-11.264 16.384-12.8 13.312-14.336 10.752-14.848 8.192-14.848 6.144-14.336 4.096-12.8 3.072-11.264 1.536-9.216 1.024H376.832l-29.696 2.048-25.088 6.144-21.504 9.216-17.408 11.776-13.824 13.824-11.264 14.848-8.704 15.36-6.144 15.872-4.096 14.848-3.072 13.824-1.536 11.264-1.024 9.216v130.56h-95.744l-9.216-1.024-11.776-3.072-13.824-5.12-14.848-7.68-15.36-11.264-15.36-15.36-14.848-19.456L28.672 678.4l-11.776-31.232-8.704-37.376L2.048 563.2 0 510.464l2.56-52.224 6.656-44.544 10.24-36.864 13.824-30.208 15.36-24.576 16.896-18.944 17.92-13.824 17.92-10.24 16.896-6.656 15.36-4.096 13.824-2.048 10.24-0.512h6.656l2.56 0.512h348.16v-35.328H266.24l-0.512-117.248-1.024-15.872 2.048-14.336 4.608-13.312 7.168-11.776 10.752-11.264 13.312-9.728 16.384-8.704 18.944-7.68 21.504-6.144L384 9.728l27.648-4.608 30.208-2.56 32.768-1.536L510.464 0l54.272 2.048 45.568 5.632zM342.016 92.16l-9.728 14.336-3.584 17.408 3.584 17.408 9.728 14.336 14.336 9.216 17.408 4.096 17.408-4.096 14.336-9.216 9.728-14.336 3.584-17.408-4.096-17.92-9.728-13.824-14.336-9.216-17.408-4.096-17.408 4.096-13.824 9.216z"
                fill="#0075AA"
                p-id="5141"
              />
              <path
                d="M900.096 260.608l11.776 2.56 13.824 5.12 14.848 7.68 15.36 11.264 15.36 14.848 14.848 19.968 13.824 25.088 11.776 31.232 9.216 37.376 6.144 44.544 2.048 52.224-2.56 52.224-6.656 44.544-10.24 36.864-13.824 30.208-15.36 24.576-16.896 19.456-17.92 14.336-17.92 10.24-16.896 6.656-15.36 4.096-13.824 2.048-10.24 1.024-6.656-0.512h-350.72v34.816H762.88l0.512 117.76 1.024 15.36-2.048 14.336-4.608 13.312-7.168 12.288-10.752 10.752-13.312 10.24-16.384 8.704-18.944 7.168-21.504 6.144-24.576 5.632-27.136 4.096-30.208 3.072-32.768 1.536-35.84 0.512-54.272-1.536-45.568-6.144-38.4-8.704-31.232-10.752-25.088-12.8-19.456-14.336-14.336-14.336-10.752-14.336-6.656-14.336-4.096-12.8-1.536-10.752-1.024-8.704 0.512-5.632v-227.84l2.048-27.136 5.632-23.04 9.216-19.456 11.264-16.384 12.8-13.824 14.336-10.24 14.848-8.704 14.848-6.144 13.824-4.096 12.8-2.56 11.264-1.536 9.216-1.024 5.632-0.512h249.344l29.696-2.048 25.088-6.144 21.504-8.704 17.408-11.776 14.336-13.824 11.264-14.848 8.704-15.36 6.144-15.36 4.096-14.848 3.072-13.824 1.536-11.776 1.024-9.216V259.072h89.088l6.144 0.512 6.656 1.024zM624.128 868.864L614.4 883.2l-3.584 17.408 3.584 17.408 9.728 14.336 14.336 9.728 17.408 3.584 17.408-3.584 14.336-9.728 9.728-14.336 3.584-17.408-3.584-17.408-9.728-14.336-14.336-9.728-17.408-3.584-17.408 3.584-14.336 9.728z"
                fill="#FFD400"
                p-id="5142"
              />
            </svg>
            <svg
              v-if="plugin.language==='java'"
              style="float:right;margin:14px 10px 0 0"
              t="1572767890841"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="2391"
              data-spm-anchor-id="a313x.7781069.0.i2"
              width="40"
              height="40"
            >
              <path
                d="M701.72245 245.828637s-162.696653 40.05327-190.648146 134.112978c-27.951493 94.059708 107.42585 114.379856 24.790581 191.957666 0 0 71.165674-36.847202 71.165675-85.796181s-67.37258-73.73956-48.316797-120.746836c19.055783-47.097588 143.008687-119.527627 143.008687-119.527627z"
                fill="#E83418"
                p-id="2392"
                data-spm-anchor-id="a313x.7781069.0.i1"
                class="selected"
              />
              <path
                d="M594.2966 68.501477s64.843851 74.371742-34.950655 184.326322-185.590687 106.116329-55.948141 286.017375c0 0-141.11214-93.427526-103.5876-183.69414s234.539666-126.481633 194.486396-286.649557z"
                fill="#E83418"
                p-id="2393"
              />
              <path
                d="M408.073731 545.79918s-88.324911 23.526216-88.324911 38.788905c0 15.262689 223.702253 34.318472 370.549191-7.631345 0 0-102.323235 46.375094-266.284253 46.375094s-251.06672-48.903823-15.940027-77.532654zM371.226529 645.593685s-45.110729 12.056621-45.110729 29.893196c0 17.791419 96.588438 69.269127 331.760286 12.688804 0 0-30.525378-15.894871-35.582837-21.629669 0 0-324.761124 46.42025-251.06672-20.952331zM390.282312 738.389029s-65.476033 55.270803 207.1752 20.320148l45.110729 22.894033s-73.73956 29.215857-163.328835 29.215858-175.385457-38.111567-88.957094-72.430039zM322.27755 804.497244s-81.370904 15.262689-81.370905 33.054108 125.217269 34.950655 275.812145 34.950654 291.074834-26.054946 256.756361-61.637782c0 0 15.894871 6.999162 15.894871 18.423601s-36.847202 64.843851-333.656832 64.84385-266.916435-44.478547-266.916436-44.478546 7.044318-34.363628 133.480796-45.155885z"
                fill="#06509B"
                p-id="2394"
                data-spm-anchor-id="a313x.7781069.0.i0"
                class="selected"
              />
              <path
                d="M303.221767 910.613573s366.710941 52.742073 523.040613-54.63862c0 0 12.056621 62.269965-228.172686 76.900471s-294.867928-22.261851-294.867927-22.261851zM708.08943 552.798342s81.370904-17.159236 81.370904 48.948979-99.162323 105.484147-99.162323 105.484147 136.641707-21.629669 136.641708-110.586762-118.850289-43.846364-118.850289-43.846364z"
                fill="#06509B"
                p-id="2395"
              />
            </svg>
            <div style="padding: 14px;">
              <span class="plugin_name">{{ plugin.plugin_name }}</span>
              <div class="bottom">
                <span style="font-size: 14px; color: #999999;">作者:</span>
                {{ plugin.author }}&nbsp;&nbsp;
                <span
                  style="font-size: 14px; color: #999999;"
                >版本号:</span>
                {{plugin.version}}&nbsp;&nbsp;
                <span
                  style="font-size: 14px; color: #999999;"
                >最近更新时间:</span>
                {{plugin.updatedAt}}
              </div>
              <div class="bottom" style="height: 50px;">
                <span class="paragraph">
                  <span style="font-size: 14px; color: #999999;">描述:</span>
                  {{ plugin.plugin_description }}
                </span>
              </div>
              <div>
                <div>
                  <span
                    v-if="download_plugin[plugin.plugin_id] && download_plugin[plugin.plugin_id].downloadStatus === 'exception' && download_plugin[plugin.plugin_id].errLog"
                    style="font-size: 12px;color: #F56C6C;float: left;margin-bottom: -15px;"
                  >{{download_plugin[plugin.plugin_id].errLog}}</span>
                  <el-progress
                    v-if="download_plugin[plugin.plugin_id]"
                    :percentage="download_plugin[plugin.plugin_id].downloadRate"
                    :status="download_plugin[plugin.plugin_id].downloadStatus"
                    class="download-progress"
                  >{{ download_plugin[plugin.plugin_id].downloadRate }}%</el-progress>
                  <el-button
                    type="danger"
                    v-if="tabName === 'local' && !plugin.is_uiauto_base_integration"
                    @click="deletePlugin(plugin)"
                    style="float: right;margin-left: 10px;"
                  >删除</el-button>
                  <el-button
                    :plain="!plugin_status[plugin.plugin_id].needUpdate"
                    :type="plugin_status[plugin.plugin_id].needUpdate ? 'primary' : 'info'"
                    :disabled="!plugin_status[plugin.plugin_id].needUpdate"
                    :loading="download_plugin[plugin.plugin_id] ? download_plugin[plugin.plugin_id].isDownloading : false"
                    style="cursor:pointer;float: right;"
                    @click="singleDownload(plugin)"
                  >{{plugin_status[plugin.plugin_id].buttonText}}</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      <div style="width: 100%;margin-top: 6px;">
        <center>
          <pagination
            style="display: inline-block;"
            :total="total"
            :page.sync="listQuery.pageIndex"
            :limit.sync="listQuery.pageSize"
            @pagination="getList"
          />
        </center>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import qs from "qs";
import { pluginList, pluginViews } from "@/api/plugin";
import Pagination from "@/components/Pagination";
import environment from "@/config/environment";
import config from "@/config/environment/index";
const fs = window.require("fs");
const path = window.require("path");
const fse = window.require("fs-extra");
const axios = window.require("axios");
var ipc = window.require("electron").ipcRenderer;
import { checkPluginsVersion } from "@/utils/index.js";
var { allDownload, executeDownload } = require("@/utils/electron.js");
import { globalSearch } from "@/utils/search.js";
import { downloadAllPlugin } from "@/utils/downloadAllPlugin.js";

export default {
  name: "PluginList",
  components: {
    Pagination
  },
  data() {
    return {
      list: [],
      total: 0,
      searchName: "",
      searchStatus: "全部",
      listQuery: {
        pageIndex: 1,
        pageSize: 6
      },
      loading: true
    };
  },
  mounted() {
    // globalSearch.$on("getSearchParameters", searchParameters => {
    //   console.warn("searchParameters");
    //   console.warn(searchParameters);
    //   this.getList(searchParameters);
    // });
    downloadAllPlugin.$on("getdownloadAllPlugin", getdownloadAll => {
      this.getAllDownloadParams();
    });
  },
  computed: {
    tabName() {
      return this.$store.state.plugin.tab;
    },
    refresh() {
      return this.$store.state.plugin.refresh;
    },
    download_plugin() {
      return this.$store.state.plugin.pluginDownload;
    },
    plugin_status() {
      return this.$store.state.plugin.pluginStatus;
    }
  },
  watch: {
    tabName: function() {
      this.listQuery = {
        pageIndex: 1,
        pageSize: 6
      };
      this.total = 0;
      this.searchStatus = "全部";
      this.searchName = "";
      this.getList();
    },
    refresh: function(newVal, oldVal) {
      this.getList();
    }
  },
  created() {
    this.getList();
  },
  methods: {
    async singleDownload(plugin) {
      if (plugin.language === "python") {
        if (this.$store.state.plugin.has_python_downloading) {
          this.$message({
            message: "当前已有python插件在下载，请稍候再下载！",
            type: "error"
          });
          return false;
        } else {
          if (plugin.plugin_id === "uiauto_uiselector") {
            window.uiselector.exit_uiselector();
          }
          this.$store.commit("plugin/MARK_PYTHON_DOWNLOADING", true);
        }
      }
      executeDownload(plugin)
        .then(result => {})
        .catch(err => {});
    },
    async getAllDownloadParams() {
      let self = this;
      pluginViews({}).then(result => {
        var screenDownloadPlugin = result.data;
        const base_integration_path = path.join(
          path.resolve(),
          "/public/base_integration/"
        );
        const base_integration_file_list = _.map(
          _.difference(fs.readdirSync(base_integration_path), [".DS_Store"]),
          file_name => {
            let versionLs = _.difference(
              fs.readdirSync(`${base_integration_path}${file_name}`),
              [".DS_Store"]
            ).sort(this.versionFn);
            return {
              plugin_id: file_name,
              version: versionLs[versionLs.length - 1]
            };
          }
        );

        const plugins_path = config.pluginsPath + "/";
        let file_name_list = _.map(
          _.difference(fs.readdirSync(plugins_path), [
            "list.json",
            "npm_i.sh",
            ".DS_Store"
          ]),
          file_name => {
            let versionLs = _.difference(
              fs.readdirSync(`${plugins_path}${file_name}`),
              [".DS_Store"]
            ).sort(this.versionFn);
            return {
              plugin_id: file_name,
              version: versionLs[versionLs.length - 1]
            };
          }
        );
        file_name_list = _.concat(file_name_list, base_integration_file_list);
        _.remove(screenDownloadPlugin, function(item) {
          let package_path = "";
          if (
            fs.existsSync(
              path.normalize(
                `${base_integration_path}${item.plugin_id}/${item.version}/package.json`
              )
            )
          ) {
            package_path = path.normalize(
              `${base_integration_path}${item.plugin_id}/${item.version}/package.json`
            );
          } else {
            package_path = path.normalize(
              `${config.pluginsPath}/${item.plugin_id}/package.json`
            );
          }

          return (
            (_.includes(file_name_list, item.plugin_id) &&
              checkPluginsVersion(
                item.version,
                fse.readJsonSync(package_path).version
              ) === false) ||
            (!!self.download_plugin[item.plugin_id] &&
              self.download_plugin[item.plugin_id]["isDownloading"] === true)
          );
        });
        _.map(screenDownloadPlugin, plugin_item => {
          return (plugin_item["latestVersion"] = plugin_item.version);
        });
        _.each(screenDownloadPlugin, (plugin, idx) => {
          let package_path = "";
          if (
            fs.existsSync(
              path.normalize(
                `${base_integration_path}${plugin.plugin_id}/${plugin.version}/package.json`
              )
            )
          ) {
            if (plugin.plugin_id === "uiauto_uiselector") {
              window.uiselector.exit_uiselector();
            }
            package_path = path.normalize(
              `${base_integration_path}${plugin.plugin_id}/${plugin.version}/package.json`
            );
          } else {
            package_path = path.normalize(
              `${config.pluginsPath}/${plugin.plugin_id}/${plugin.version}/package.json`
            );
          }
          if (fs.existsSync(package_path)) {
            const package_json = fse.readJsonSync(package_path);
            plugin.is_uiauto_base_integration = !!package_json.is_uiauto_base_integration;
          } else {
            plugin.is_uiauto_base_integration = false;
          }

          const downloadParams = {
            plugin_id: plugin.plugin_id,
            downloadRate: 0,
            downloadStatus: "text",
            isWaitDownload: true,
            isDownloading: true
          };
          this.$store.commit("plugin/PLUGIN_DOWNLOAD", downloadParams);
          const thePluginStatus = {
            plugin_id: plugin.plugin_id,
            needUpdate: true,
            buttonText: "等待下载"
          };
          this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
        });
        setTimeout(() => {
          allDownload(screenDownloadPlugin, 0);
        }, 0);
      });
    },
    getList() {
      if (_.includes(["下载", "更新"], this.searchStatus)) {
        this.handleFilter();
      } else {
        this.loading = true;
        this.list = [];
        if (this.tabName === "all") {
          this.getWebPlugins();
        } else if (this.tabName === "local") {
          this.getLocalPlugins();
        }
      }
    },
    handleSeach() {
      this.listQuery = {
        pageIndex: 1,
        pageSize: 6
      };
      this.getList();
    },
    getWebPlugins() {
      return new Promise((reslove, reject) => {
        // var plugins_path = path.normalize(
        //   path.resolve() + "/.." + "/web/public/plugins/"
        // );
        const base_integration_path = path.join(
          path.resolve(),
          "/public/base_integration/"
        );
        var plugins_path = config.pluginsPath + "/";
        if (this.searchName !== "") {
          this.listQuery.where = {
            plugin_name: this.searchName
          };
        } else {
          this.listQuery.where = {};
        }
        pluginList(this.listQuery)
          .then(result => {
            var webPluginList = result.data.list;
            var version_list = {};
            var plugin_list = [];
            _.map(webPluginList, thePlugin => {
              var package_json_path = `${plugins_path}${thePlugin.plugin_id}/${thePlugin.version}/package.json`;
              if (!fs.existsSync(package_json_path)) {
                package_json_path =
                  base_integration_path + thePlugin.plugin_id + "/package.json";
              }
              if (thePlugin.plugin_id === "uiauto_logMonitor") {
                thePlugin.is_uiauto_base_integration = true;
              }
              if (fs.existsSync(package_json_path)) {
                var package_json = fse.readJsonSync(package_json_path);
                thePlugin.is_uiauto_base_integration = !!package_json.is_uiauto_base_integration;
                thePlugin.latestVersion = thePlugin.version;
                const thePluginStatus = {
                  plugin_id: thePlugin.plugin_id,
                  needUpdate: checkPluginsVersion(
                    thePlugin.version,
                    package_json.version
                  )
                    ? true
                    : false,
                  buttonText: this.download_plugin[thePlugin.plugin_id]
                    ? this.download_plugin[thePlugin.plugin_id][
                        "downloadStatus"
                      ] === "exception"
                      ? "重新下载"
                      : this.download_plugin[thePlugin.plugin_id][
                          "isWaitDownload"
                        ] === true
                      ? "等待下载"
                      : "正在下载"
                    : checkPluginsVersion(
                        thePlugin.version,
                        package_json.version
                      )
                    ? "更新"
                    : "已安装最新版本"
                };
                this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
                // thePlugin.isDownloading = this.download_plugin[thePlugin.plugin_id]? (this.download_plugin[thePlugin.plugin_id]["downloadStatus"] === "exception"? false: true ): false;
                // thePlugin.needUpdate = thePlugin.version > package_json.version ? true : false;
                // thePlugin.buttonText = this.download_plugin[thePlugin.plugin_id] ? (this.download_plugin[thePlugin.plugin_id]["downloadStatus"] === "exception" ? "重新下载" : "正在下载") : (thePlugin.version > package_json.version ? "更新" : "已安装最新版本");
              } else {
                thePlugin.latestVersion = thePlugin.version;
                const thePluginStatus = {
                  plugin_id: thePlugin.plugin_id,
                  needUpdate: true,
                  buttonText: this.download_plugin[thePlugin.plugin_id]
                    ? this.download_plugin[thePlugin.plugin_id][
                        "downloadStatus"
                      ] === "exception"
                      ? "重新下载"
                      : this.download_plugin[thePlugin.plugin_id][
                          "isWaitDownload"
                        ] === true
                      ? "等待下载"
                      : "正在下载"
                    : "下载"
                };
                this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
                // thePlugin.isDownloading = this.download_plugin[thePlugin.plugin_id]? (this.download_plugin[thePlugin.plugin_id]["downloadStatus"] === "exception" ? false : true) : false;
                // thePlugin.needUpdate = true;
                // thePlugin.buttonText = this.download_plugin[thePlugin.plugin_id]? (this.download_plugin[thePlugin.plugin_id]["downloadStatus"] === "exception"? "重新下载": "正在下载") : "下载";
              }
            });
            this.list = webPluginList;
            this.total = result.data.total;
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
            console.warn("err");
            console.warn(err);
          });
      });
    },
    versionFn(str1, str2) {
      var arr1 = str1.split("."),
        arr2 = str2.split("."),
        minLen = Math.min(arr1.length, arr2.length),
        maxLen = Math.max(arr1.length, arr2.length);

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
    getLocalPlugins() {
      // 插件目录
      // const plugins_path = path.normalize(
      //   path.resolve() + "/.." + "/web/public/plugins/"
      // );
      const base_integration_path = path.join(
        path.resolve(),
        "/public/base_integration/"
      );
      const base_integration_file_list = _.map(
        _.difference(fs.readdirSync(base_integration_path), [".DS_Store"]),
        file_name => {
          let versionLs = _.difference(
            fs.readdirSync(`${base_integration_path}${file_name}`),
            [".DS_Store"]
          ).sort(this.versionFn);
          return {
            plugin_id: file_name,
            version: versionLs[versionLs.length - 1]
          };
        }
      );

      const plugins_path = config.pluginsPath + "/";
      let file_name_list = _.map(
        _.difference(fs.readdirSync(plugins_path), [
          "list.json",
          "npm_i.sh",
          ".DS_Store"
        ]),
        file_name => {
          let versionLs = _.difference(
            fs.readdirSync(`${plugins_path}${file_name}`),
            [".DS_Store"]
          ).sort(this.versionFn);
          return {
            plugin_id: file_name,
            version: versionLs[versionLs.length - 1]
          };
        }
      );
      file_name_list = _.concat(file_name_list, base_integration_file_list);
      let plugin_list = [];
      let where = {};
      if (this.searchName !== "") {
        where = {
          plugin_name: this.searchName
        };
      } else {
        where = {
          plugin_name: _.map(file_name_list, "plugin_id")
        };
      }
      pluginViews(where)
        .then(result => {
          var webPluginViews = result.data;
          if (this.searchName !== "") {
            file_name_list = _.pullAllWith(
              file_name_list,
              _.map(webPluginViews, item => {
                return { plugin_id: item.plugin_id, version: item.version };
              }),
              _.isEqual
            );
          }
          _.map(file_name_list, item => {
            var package_json_path = `${plugins_path}${item.plugin_id}/${item.version}/package.json`;
            if (!fs.existsSync(package_json_path)) {
              package_json_path = `${base_integration_path}/${item.plugin_id}/${item.version}/package.json`;
            }
            if (fs.existsSync(package_json_path)) {
              var package_json = fse.readJsonSync(package_json_path);
              var the_plugin = _.find(webPluginViews, function(plugin_item) {
                return plugin_item.plugin_id == package_json.id;
              });
              if (package_json.id === "uiauto_logMonitor") {
                package_json.is_uiauto_base_integration = true;
              }
              plugin_list.push({
                plugin_id: package_json.id,
                plugin_name: package_json.name,
                author: package_json.author,
                version: package_json.version,
                language: package_json.language,
                latestVersion: the_plugin
                  ? the_plugin.version
                  : package_json.version,
                plugin_description: package_json.description,
                attachment_md5: the_plugin ? the_plugin.attachment_md5 : null,
                is_uiauto_base_integration: !!package_json.is_uiauto_base_integration
                // needUpdate: this.download_plugin[package_json.id] ? true : (the_plugin.version > package_json.version ? true : false),
                // buttonText: this.download_plugin[package_json.id] ? "正在下载" : (the_plugin.version > package_json.version ? "更新" : "已安装最新版本"),
              });
              const thePluginStatus = {
                plugin_id: package_json.id,
                needUpdate: this.download_plugin[package_json.id]
                  ? true
                  : checkPluginsVersion(
                      the_plugin ? the_plugin.version : package_json.version,
                      package_json.version
                    )
                  ? true
                  : false,
                buttonText: this.download_plugin[package_json.id]
                  ? this.download_plugin[package_json.id]["downloadStatus"] ===
                    "exception"
                    ? "重新下载"
                    : this.download_plugin[package_json.id][
                        "isWaitDownload"
                      ] === true
                    ? "等待下载"
                    : "正在下载"
                  : checkPluginsVersion(
                      the_plugin ? the_plugin.version : package_json.version,
                      package_json.version
                    )
                  ? "更新"
                  : "已安装最新版本"
              };
              this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
            }
          });
          this.list = _.chunk(plugin_list, this.listQuery.pageSize)[
            this.listQuery.pageIndex - 1
          ];
          this.total = plugin_list.length;
          this.loading = false;
        })
        .catch(err => {
          console.warn(err);
          this.loading = false;
        });
    },
    deletePlugin(val) {
      this.$confirm("此操作将永久删除该插件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const loading = this.$loading({
            text: "正在删除",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
            target: "#" + val.plugin_id
          });
          const plugins_path = config.pluginsPath + "/";
          var all_plugins_path = _.difference(fs.readdirSync(plugins_path), [
            "list.json"
          ]);
          var delete_path =
            plugins_path +
            all_plugins_path[_.indexOf(all_plugins_path, val.plugin_id)] +
            "/";
          if (fs.existsSync(delete_path)) {
            try {
              fse.emptyDirSync(delete_path);
              fs.rmdirSync(delete_path);
              loading.close();
              this.getList();
              this.$message({
                showClose: true,
                message: "删除成功",
                type: "success"
              });
            } catch (err) {
              loading.close();
              this.$message({
                showClose: true,
                message: err,
                type: "error"
              });
            }
          } else {
            loading.close();
            this.$message({
              showClose: true,
              message: "删除失败，插件已被删除或文件不合法",
              type: "error"
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    handleFilterInit() {
      this.listQuery.pageIndex = 1;
      this.handleFilter();
    },
    handleFilter() {
      if (_.includes(["下载", "更新"], this.searchStatus)) {
        let pluginList = [];
        let pluginStatusList = [];
        let fileNameList = _.concat(
          _.difference(fs.readdirSync(`${config.pluginsPath}/`), [
            "list.json",
            "npm_i.sh",
            ".DS_Store"
          ]),
          fs.readdirSync(path.join(path.resolve(), "/public/base_integration/"))
        );
        pluginViews({}).then(result => {
          _.each(result.data, pluginItem => {
            var package_json_path = `${config.pluginsPath}/${pluginItem.plugin_id}/package.json`;
            var base_integration_path = path.join(
              path.resolve(),
              "/public/base_integration/"
            );
            if (!fs.existsSync(package_json_path)) {
              package_json_path =
                base_integration_path + pluginItem.plugin_id + "/package.json";
            }
            if (
              _.includes(
                ["uiauto_executor", "uiauto_uiselector", "uiauto_logMonitor"],
                pluginItem.plugin_id
              )
            ) {
              pluginItem.is_uiauto_base_integration = true;
            } else {
              pluginItem.is_uiauto_base_integration = false;
            }

            // 本地插件版本
            let localPluginVersion = _.includes(
              fileNameList,
              pluginItem.plugin_id
            )
              ? fse.readJsonSync(package_json_path).version
              : null;
            let thePluginStatus = {
              plugin_id: pluginItem.plugin_id,
              needUpdate:
                this.searchStatus === "下载"
                  ? true
                  : checkPluginsVersion(
                      pluginItem.version,
                      localPluginVersion
                        ? localPluginVersion
                        : pluginItem.version
                    )
                  ? true
                  : false,
              buttonText: _.includes(fileNameList, pluginItem.plugin_id)
                ? checkPluginsVersion(
                    pluginItem.version,
                    localPluginVersion ? localPluginVersion : pluginItem.version
                  )
                  ? "更新"
                  : "已安装最新版本"
                : "下载"
            };
            pluginStatusList.push(thePluginStatus);
            this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
          });
          if (this.searchStatus === "下载") {
            _.each(pluginStatusList, statusItem => {
              if (statusItem.buttonText === "下载") {
                let target = _.find(result.data, {
                  plugin_id: statusItem.plugin_id
                });
                if (this.searchName !== "") {
                  if (
                    target &&
                    (target.plugin_id.indexOf(this.searchName) > -1 ||
                      (target.plugin_description &&
                        target.plugin_description.indexOf(this.searchName) >
                          -1))
                  ) {
                    pluginList.push({
                      plugin_id: target.plugin_id,
                      plugin_name: target.plugin_name,
                      author: target.author,
                      version: target.version,
                      latestVersion: target.version,
                      language: target.language,
                      plugin_description: target.plugin_description,
                      attachment_md5: target.attachment_md5,
                      is_uiauto_base_integration:
                        target.is_uiauto_base_integration,
                      updatedAt: target.updatedAt
                    });
                  }
                } else {
                  pluginList.push({
                    plugin_id: target.plugin_id,
                    plugin_name: target.plugin_name,
                    author: target.author,
                    version: target.version,
                    latestVersion: target.version,
                    language: target.language,
                    plugin_description: target.plugin_description,
                    attachment_md5: target.attachment_md5,
                    is_uiauto_base_integration:
                      target.is_uiauto_base_integration,
                    updatedAt: target.updatedAt
                  });
                }
              }
            });
          } else if (this.searchStatus === "更新") {
            _.each(pluginStatusList, statusItem => {
              if (statusItem.buttonText === "更新") {
                let target = _.find(result.data, {
                  plugin_id: statusItem.plugin_id
                });
                if (this.searchName !== "") {
                  if (
                    target &&
                    (target.plugin_id.indexOf(this.searchName) > -1 ||
                      (target.plugin_description &&
                        target.plugin_description.indexOf(this.searchName) >
                          -1))
                  ) {
                    pluginList.push({
                      plugin_id: target.plugin_id,
                      plugin_name: target.plugin_name,
                      author: target.author,
                      version: target.version,
                      latestVersion: target.version,
                      language: target.language,
                      plugin_description: target.plugin_description,
                      attachment_md5: target.attachment_md5,
                      is_uiauto_base_integration:
                        target.is_uiauto_base_integration,
                      updatedAt: target.updatedAt
                    });
                  }
                } else {
                  pluginList.push({
                    plugin_id: target.plugin_id,
                    plugin_name: target.plugin_name,
                    author: target.author,
                    version: target.version,
                    latestVersion: target.version,
                    language: target.language,
                    plugin_description: target.plugin_description,
                    attachment_md5: target.attachment_md5,
                    is_uiauto_base_integration:
                      target.is_uiauto_base_integration,
                    updatedAt: target.updatedAt
                  });
                }
              }
            });
          }
          this.list = _.chunk(pluginList, this.listQuery.pageSize)[
            this.listQuery.pageIndex - 1
          ];
          this.total = pluginList.length;
        });
      } else {
        this.listQuery.pageIndex = 1;
        this.getList();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/.app-main-content {
  height: calc(100vh - 80px);
}
.app-container {
  background-color: #f0f2f5;
}
.filter-container {
  padding: 10px 20px 0 20px;
  font-size: 12px;
}

/deep/.el-card {
  border-radius: 5px;
  border: 1px solid #cccccc;
}
.card-panel-col {
  padding-right: 0px !important;
}

.plugin_name {
  font-size: 14px;
  color: #4a90e2;
}
.time {
  font-size: 13px;
  color: #999;
}
.paragraph {
  font-size: 14px;
  color: #151515;
  line-height: 25.89px;
  word-spacing: 0.8px;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.bottom {
  margin-top: 15px;
  line-height: 12px;
}

.download-progress {
  // float: left;
  display: inline-block;
  width: 350px;
  margin-top: 23px;
  // margin-top: 6px;
  margin-bottom: 15px;
}

// .button {
//   font-size: 12px;
//   color: #fff;
//   margin-top: 10px;
//   margin-bottom: 15px;
//   margin-left: 10px;
//   padding: 10px 20px;
//   border-radius: 8px;
//   border: none;
//   outline: none;
//   -webkit-transition: all 0.6s ease;
//   transition: all 0.6s ease;
//   float: right;
//   // display: inline-block;
// }

.card-panel > .el-card {
  height: 100%;
}
</style>
