<template>
  <div>
    <div class="app-actionBar">
      <div class="left-menu">插件库</div>
      <transition name="el-fade-in-linear">
        <div v-if="allDownloadStatus" class="allDownloadStatus">
          <div class="downloaded">总下载：{{ allDownloads.needDownload }}</div>
          <div class="downloaded">成功：{{ allDownloads.downloaded }}</div>
          <div class="downloaded">失败：{{ allDownloads.errorDownload }}</div>
          <el-tooltip
            effect="dark"
            :content="allDownloads.pluginId ? allDownloads.pluginId : '--'"
            placement="bottom"
          >
            <div class="downloading">
              <span
                >正在下载：{{
                  allDownloads.pluginId ? allDownloads.pluginId : "--"
                }}
              </span>
            </div>
          </el-tooltip>
          <el-progress
            :percentage="
              getPercent(
                allDownloads.downloaded + allDownloads.errorDownload,
                allDownloads.needDownload
              )
            "
            >{{
              getPercent(
                allDownloads.downloaded + allDownloads.errorDownload,
                allDownloads.needDownload
              )
            }}%</el-progress
          >
        </div>
      </transition>
      <div class="action-button">
        <el-button
          type="primary"
          size="mini"
          @click="handleCompressionPlugin()"
        >
          <i class="el-icon-menu" />
          压缩插件
        </el-button>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-upload2"
          @click="handleUploadPlugin()"
        >
          导入插件
        </el-button>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-download"
          :loading="allDownloadStatus"
          @click="handleAllDownload()"
        >
          {{ allDownloadStatus === true ? "正在下载" : "全部下载" }}
        </el-button>
      </div>
      <div class="header-search">
        <el-input
          v-model="searchName"
          placeholder="插件名称"
          class="header-search-select"
          clearable
          @keyup.enter.native="handleSeach"
        >
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-select
          v-model="searchStatus"
          class="header-search-select"
          @change="handleFilter"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </div>
    </div>

    <div class="app-container">
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column
          label="插件名称"
          width="180px"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="{ row }">
            <span>{{ row.pluginName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本" width="110px" align="center">
          <template slot-scope="{ row }">
            <span class="link-type">{{ row.version }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="插件描述"
          min-width="60px"
          show-overflow-tooltip
        >
          <template slot-scope="{ row }">
            <span>{{ row.pluginDescription }}</span>
          </template>
        </el-table-column>
        <el-table-column label="作者" width="110px" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.author }}</span>
          </template>
        </el-table-column>
        <el-table-column label="开发语言" width="110px" align="center">
          <template slot-scope="{ row }">
            <el-tooltip effect="dark" :content="row.language" placement="top">
              <font-awesome-icon
                style="font-size: 20px"
                :icon="row.language | languageFilter"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="插件来源" width="110px" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.isOfficial | sourceFilter">
              {{ row.isOfficial | sourceChineseFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="更新时间"
          width="180px"
          align="center"
          v-if="searchStatus !== 'local'"
        >
          <template slot-scope="{ row }">
            <span>
              {{
                row.updateTime
                  ? row.updateTime
                  : row.createTime
                  ? row.createTime
                  : "--"
              }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="300"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-tooltip
              v-if="
                download_plugin[`${row.plugin_id}${row.version}`] &&
                download_plugin[`${row.plugin_id}${row.version}`]
                  .downloadStatus === 'exception' &&
                download_plugin[`${row.plugin_id}${row.version}`].errLog
              "
              effect="dark"
              :content="
                download_plugin[`${row.plugin_id}${row.version}`].errLog
              "
              placement="top"
            >
              <i class="el-icon-warning" style="color: #e6a23c" />
            </el-tooltip>
            <el-button
              v-if="searchStatus !== 'local'"
              element-loading-background="rgba(0, 0, 0, 0)"
              :class="
                plugin_status[`${row.plugin_id}${row.version}`] &&
                plugin_status[`${row.plugin_id}${row.version}`].needUpdate
                  ? 'suButton'
                  : 'inButton'
              "
              type="text"
              :disabled="
                plugin_status[`${row.plugin_id}${row.version}`] &&
                !plugin_status[`${row.plugin_id}${row.version}`].needUpdate
              "
              :loading="
                download_plugin[`${row.plugin_id}${row.version}`]
                  ? download_plugin[`${row.plugin_id}${row.version}`]
                      .isDownloading
                  : false
              "
              style="cursor: pointer"
              @click="singleDownload(row)"
              >{{
                plugin_status[`${row.plugin_id}${row.version}`]
                  ? plugin_status[`${row.plugin_id}${row.version}`].buttonText
                  : ""
              }}</el-button
            >
            <el-button
              type="text"
              class="plButton"
              v-if="searchStatus !== 'local'"
              @click="showHistoryPlugin(row)"
              >历史版本</el-button
            >
            <el-button
              type="text"
              class="erButton"
              v-if="
                row.isUiautoBaseIntegration
                  ? !row.isUiautoBaseIntegration
                  : searchStatus !== 'local'
                  ? plugin_status[`${row.plugin_id}${row.version}`] &&
                    plugin_status[`${row.plugin_id}${row.version}`]
                      .needUpdate === false
                  : true
              "
              @click="deletePlugin(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.pageNo"
        :limit.sync="listQuery.pageSize"
        @pagination="getList"
      />
    </div>
    <uploadPlugin ref="uploadPlugin" />
    <historyPlugin ref="historyPlugin" />
    <compressionPlugin ref="compressionPlugin" />
  </div>
</template>

<script>
import _ from "lodash";
import { pluginList, pluginViews } from "@/api/plugin";
import config from "@/config/environment/index";
var os = window.nodeRequire("os");
const fs = window.nodeRequire("fs");
const path = window.nodeRequire("path");
const fse = window.nodeRequire("fs-extra");
const { app } = window.nodeRequire("@electron/remote");
import { checkPluginsVersion } from "@/utils/index.js";
var { allDownload, executeDownload } = require("@/utils/electron.js");
import uploadPlugin from "./components/uploadPlugin";
import historyPlugin from "./components/historyPlugin";
import compressionPlugin from "./components/compressionPlugin";
import Pagination from "@/components/Pagination";

export default {
  name: "PluginList",
  components: { Pagination, uploadPlugin, historyPlugin, compressionPlugin },
  filters: {
    languageFilter(language) {
      const languageMap = {
        nodejs: "fa-brands fa-node-js",
        python: "fa-brands fa-python",
        java: "fa-brands fa-java",
        unknow: "fa-regular fa-circle-question",
      };
      return languageMap[language];
    },
    sourceFilter(source) {
      const sourceMap = {
        true: "success",
        false: "info",
        unknow: "warning",
      };
      return sourceMap[source];
    },
    sourceChineseFilter(status) {
      const sourceChineseMap = {
        true: "官方插件",
        false: "非官方插件",
        unknow: "未知",
      };
      return sourceChineseMap[status];
    },
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      searchName: "",
      searchStatus: "all",
      statusOptions: [
        { label: "全部", key: "all" },
        // { label: "已下载", key: "downloaded" },
        { label: "可下载", key: "canDownload" },
        { label: "可更新", key: "canUpgrade" },
        { label: "个人插件", key: "local" },
      ],
      listQuery: {
        pageNo: 1,
        pageSize: 20,
      },
      downloadLoading: false,
    };
  },
  computed: {
    refresh() {
      return this.$store.state.plugin.pluginRefresh;
    },
    download_plugin() {
      return this.$store.state.plugin.pluginDownload;
    },
    plugin_status() {
      return this.$store.state.plugin.pluginStatus;
    },
    allDownloadStatus() {
      return this.$store.state.plugin.has_all_plugin_downloading;
    },
    allDownloads() {
      return this.$store.state.plugin.allDownloads;
    },
  },
  watch: {
    searchName: function () {
      if (this.searchName.length == 0) {
        this.listQuery = {
          pageNo: 1,
          pageSize: 20,
        };
        this.total = 0;
        this.getList();
      }
    },
    refresh: function (newVal, oldVal) {
      this.getList();
    },
  },
  created() {
    this.getList();
  },
  methods: {
    async singleDownload(plugin) {
      let can_download_plugin = plugin.attachmentPath
        ? plugin
        : plugin.webPlugin;
      if (can_download_plugin === null) {
        this.$message({
          message: "无法找到该插件有效信息，请检查插件情况再下载",
          type: "error",
        });
        return false;
      }
      // if (plugin.language === "python") {
      // if (this.$store.state.plugin.has_python_downloading) {
      //   this.$message({
      //     message: "当前已有python插件在下载，请稍候再下载！",
      //     type: "error",
      //   });
      //   return false;
      // } else {
      if (plugin.plugin_id === "uiauto_uiselector") {
        if (os.platform() === "win32") {
          window["uiselector"] = window.nodeRequire(
            path.normalize(
              path.resolve() +
                "/public/base_integration/uiauto_uiselector/index.js"
            )
          );
          window["uiselector"].exit_uiselector();
        } else {
          window["uiselector"] = window.nodeRequire(
            path.normalize(
              path.resolve() +
                "/public/base_integration/uiauto_uiselector_ukylin/index.js"
            )
          );
          window["uiselector"].exit_uiselector();
        }
      }
      this.$store.commit("plugin/MARK_PYTHON_DOWNLOADING", true);
      // }
      // }
      executeDownload(can_download_plugin)
        .then((result) => {
          this.getList();
        })
        .catch((err) => {});
    },
    async getAllDownloadParams() {
      let self = this;
      pluginViews({
        needs: "last",
      })
        .then((result) => {
          var screenDownloadPlugin = [];
          _.map(result.result, (item) => {
            let newPluginObj = _.cloneDeep(item);
            newPluginObj.plugin_id = item.pluginId;
            newPluginObj.isUiautoBaseIntegration =
              item.isUiautoBaseIntegration === "true" ? true : false;
            delete newPluginObj.pluginId;
            screenDownloadPlugin.push(newPluginObj);
            return item;
          });
          const base_integration_path = path.join(
            path.resolve(),
            "/public/base_integration/"
          );
          const base_integration_file_list = _.map(
            _.difference(fs.readdirSync(base_integration_path), [".DS_Store"]),
            (file_name) => {
              return {
                plugin_id: fs.existsSync(
                  `${base_integration_path}${file_name}/package.json`
                )
                  ? fse.readJsonSync(
                      `${base_integration_path}${file_name}/package.json`
                    ).id
                  : file_name,
                version: fs.existsSync(
                  `${base_integration_path}${file_name}/package.json`
                )
                  ? fse.readJsonSync(
                      `${base_integration_path}${file_name}/package.json`
                    ).version
                  : "",
              };
            }
          );

          const plugins_path = config.pluginsPath + "/";
          let file_name_list = _.map(
            _.difference(fs.readdirSync(plugins_path), [
              "list.json",
              "npm_i.sh",
              ".DS_Store",
            ]),
            (file_name) => {
              let versionLs = _.difference(
                fs.readdirSync(`${plugins_path}${file_name}`),
                [".DS_Store"]
              ).sort(this.versionFn);
              return {
                plugin_id: file_name,
                version: versionLs[versionLs.length - 1],
              };
            }
          );
          file_name_list = _.concat(file_name_list, base_integration_file_list);
          _.remove(screenDownloadPlugin, function (item) {
            let package_path = "";
            if (
              fs.existsSync(
                path.normalize(
                  `${base_integration_path}${item.plugin_id}/package.json`
                )
              )
            ) {
              package_path = path.normalize(
                `${base_integration_path}${item.plugin_id}/package.json`
              );
            } else {
              package_path = path.normalize(
                `${config.pluginsPath}/${item.plugin_id}/${item.version}/package.json`
              );
            }

            return (
              (fs.existsSync(package_path) &&
                _.includes(
                  _.uniq(_.map(file_name_list, "plugin_id")),
                  item.plugin_id
                ) &&
                checkPluginsVersion(
                  item.version,
                  fse.readJsonSync(package_path).version
                ) === false) ||
              (!!self.download_plugin[`${item.plugin_id}${item.version}`] &&
                self.download_plugin[`${item.plugin_id}${item.version}`][
                  "isDownloading"
                ] === true)
            );
          });

          if (screenDownloadPlugin.length) {
            _.map(screenDownloadPlugin, (plugin_item) => {
              return (plugin_item["latestVersion"] = plugin_item.version);
            });

            _.each(screenDownloadPlugin, (plugin, idx) => {
              if (
                fs.existsSync(
                  path.normalize(
                    `${base_integration_path}${plugin.plugin_id}/package.json`
                  )
                )
              ) {
                if (plugin.plugin_id === "uiauto_uiselector") {
                  if (os.platform() === "win32") {
                    window["uiselector"] = window.nodeRequire(
                      path.normalize(
                        path.resolve() +
                          "/public/base_integration/uiauto_uiselector/index.js"
                      )
                    );
                    window["uiselector"].exit_uiselector();
                  } else {
                    window["uiselector"] = window.nodeRequire(
                      path.normalize(
                        path.resolve() +
                          "/public/base_integration/uiauto_uiselector_ukylin/index.js"
                      )
                    );
                    window["uiselector"].exit_uiselector();
                  }
                }
              }
              // if (fs.existsSync(package_path)) {
              //   const package_json = fse.readJsonSync(package_path);
              //   plugin.is_uiauto_base_integration =
              //     !!package_json.is_uiauto_base_integration;
              // } else {
              //   plugin.is_uiauto_base_integration = false;
              // }

              const downloadParams = {
                plugin_id: plugin.plugin_id,
                version: plugin.version,
                downloadRate: 0,
                downloadStatus: null,
                isWaitDownload: true,
                isDownloading: true,
              };
              this.$store.commit("plugin/PLUGIN_DOWNLOAD", downloadParams);
              const thePluginStatus = {
                plugin_id: plugin.plugin_id,
                version: plugin.version,
                needUpdate: true,
                buttonText: "等待下载",
              };
              this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
            });
            this.$store.commit("plugin/SET_ALL_DOWNLOADS", {
              downloaded: "0",
              errorDownload: "0",
              needDownload: screenDownloadPlugin.length,
              pluginId: null,
            });
            setTimeout(() => {
              allDownload(screenDownloadPlugin, 0);
            }, 0);
          } else {
            this.$message({
              message: `暂无需要下载的插件`,
            });
          }
        })
        .catch((err) => {
          console.log("err", err);
          this.$store.commit("plugin/ALL_PLUGIN_DOWNLOADING", false);
        });
    },
    getList() {
      if (this.searchStatus === "all") {
        this.getWebPlugins();
      }
      // else if (this.searchStatus === "downloaded") {
      //   this.getDownloadedPlugins();
      // }
      else if (
        this.searchStatus === "canDownload" ||
        this.searchStatus === "canUpgrade"
      ) {
        this.downloadOrUpgrade();
      } else if (this.searchStatus === "local") {
        this.getLocalPlugins();
      }
    },
    getWebPlugins() {
      return new Promise((resolve, reject) => {
        this.listLoading = true;
        let base_integration_path;
        if (os.platform() == "darwin" && path.resolve() == "/") {
          base_integration_path = path.normalize(
            app.getPath("exe") + "../../../public/base_integration/"
          );
        } else {
          base_integration_path = path.join(
            path.resolve(),
            "/public/base_integration/"
          );
        }
        const base_integration_file_list = _.map(
          _.difference(fs.readdirSync(base_integration_path), [".DS_Store"]),
          (file_name) => {
            return {
              plugin_id: fs.existsSync(
                `${base_integration_path}${file_name}/package.json`
              )
                ? fse.readJsonSync(
                    `${base_integration_path}${file_name}/package.json`
                  ).id
                : file_name,
              version: fs.existsSync(
                `${base_integration_path}${file_name}/package.json`
              )
                ? fse.readJsonSync(
                    `${base_integration_path}${file_name}/package.json`
                  ).version
                : "",
            };
          }
        );

        const plugins_path = path.normalize(config.pluginsPath + "/");
        let fileNameList = _.map(
          _.difference(fs.readdirSync(plugins_path), [
            "list.json",
            "npm_i.sh",
            ".DS_Store",
          ]),
          (file_name) => {
            let versionLs = _.difference(
              fs.readdirSync(`${plugins_path}${file_name}`),
              [".DS_Store"]
            ).sort(this.versionFn);
            return {
              plugin_id: file_name,
              version: versionLs[versionLs.length - 1],
            };
          }
        );

        fileNameList = _.concat(fileNameList, base_integration_file_list);
        let sqp = {};
        if (this.searchName !== "") {
          let queryParams = [
            {
              rule: "like",
              type: "string",
              dictCode: "",
              val: this.searchName,
              field: "pluginName",
            },
          ];
          sqp["superQueryParams"] = encodeURI(JSON.stringify(queryParams));
          sqp["superQueryMatchType"] = "and";
        }
        pluginList(Object.assign(sqp, this.listQuery))
          .then((result) => {
            var webPluginList = [];
            _.map(result.result.records, (item) => {
              let newPluginObj = _.cloneDeep(item);
              newPluginObj.plugin_id = item.pluginId;
              newPluginObj.isUiautoBaseIntegration =
                item.isUiautoBaseIntegration === "true" ? true : false;
              delete newPluginObj.pluginId;
              webPluginList.push(newPluginObj);
              return item;
            });

            _.map(webPluginList, (thePlugin) => {
              let target = _.find(fileNameList, {
                plugin_id: thePlugin.plugin_id,
              });
              if (target) {
                let package_json_path = path.normalize(
                  `${plugins_path}${target.plugin_id}/${target.version}/package.json`
                );
                if (!fs.existsSync(package_json_path)) {
                  package_json_path = path.normalize(
                    `${base_integration_path}${target.plugin_id}/package.json`
                  );
                }
                if (fs.existsSync(package_json_path)) {
                  // if (
                  //   _.includes(
                  //     _.map(base_integration_file_list, "plugin_id"),
                  //     target.plugin_id
                  //   )
                  // ) {
                  //   target.is_uiauto_base_integration = true;
                  // }
                  let package_json = fse.readJsonSync(package_json_path);
                  // thePlugin.is_uiauto_base_integration =
                  //   !!package_json.is_uiauto_base_integration;
                  thePlugin.latestVersion = thePlugin.version;
                  const thePluginStatus = {
                    plugin_id: thePlugin.plugin_id,
                    version: thePlugin.version,
                    needUpdate: checkPluginsVersion(
                      thePlugin.version,
                      package_json.version
                    )
                      ? true
                      : false,
                    buttonText: this.download_plugin[
                      `${thePlugin.plugin_id}${thePlugin.version}`
                    ]
                      ? this.download_plugin[
                          `${thePlugin.plugin_id}${thePlugin.version}`
                        ]["downloadStatus"] === "exception"
                        ? "重新下载"
                        : this.download_plugin[
                            `${thePlugin.plugin_id}${thePlugin.version}`
                          ]["isWaitDownload"] === true
                        ? "等待下载"
                        : "正在下载"
                      : checkPluginsVersion(
                          thePlugin.version,
                          package_json.version
                        )
                      ? "更新"
                      : "已安装",
                  };
                  this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
                } else {
                  thePlugin.latestVersion = thePlugin.version;
                  const thePluginStatus = {
                    plugin_id: thePlugin.plugin_id,
                    version: thePlugin.version,
                    needUpdate: true,
                    buttonText: this.download_plugin[
                      `${thePlugin.plugin_id}${thePlugin.version}`
                    ]
                      ? this.download_plugin[
                          `${thePlugin.plugin_id}${thePlugin.version}`
                        ]["downloadStatus"] === "exception"
                        ? "重新下载"
                        : this.download_plugin[
                            `${thePlugin.plugin_id}${thePlugin.version}`
                          ]["isWaitDownload"] === true
                        ? "等待下载"
                        : "正在下载"
                      : "下载",
                  };
                  this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
                }
              } else {
                thePlugin.latestVersion = thePlugin.version;
                const thePluginStatus = {
                  plugin_id: thePlugin.plugin_id,
                  version: thePlugin.version,
                  needUpdate: true,
                  buttonText: this.download_plugin[
                    `${thePlugin.plugin_id}${thePlugin.version}`
                  ]
                    ? this.download_plugin[
                        `${thePlugin.plugin_id}${thePlugin.version}`
                      ]["downloadStatus"] === "exception"
                      ? "重新下载"
                      : this.download_plugin[
                          `${thePlugin.plugin_id}${thePlugin.version}`
                        ]["isWaitDownload"] === true
                      ? "等待下载"
                      : "正在下载"
                    : "下载",
                };
                this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
              }
            });
            this.list = webPluginList;
            this.total = result.result.total;
            this.listLoading = false;
          })
          .catch((err) => {
            this.listLoading = false;
          });
      });
    },
    // getDownloadedPlugins() {
    //   return new Promise((resolve, reject) => {
    //     this.listLoading = true;
    //     const base_integration_path = path.normalize(
    //       path.join(path.resolve(), "/public/base_integration/")
    //     );
    //     const base_integration_file_list = _.map(
    //       _.difference(fs.readdirSync(base_integration_path), [".DS_Store"]),
    //       (file_name) => {
    //         return {
    //           plugin_id: fs.existsSync(
    //             `${base_integration_path}${file_name}/package.json`
    //           )
    //             ? fse.readJsonSync(
    //                 `${base_integration_path}${file_name}/package.json`
    //               ).id
    //             : file_name,
    //           plugin_name: fs.existsSync(
    //             `${base_integration_path}${file_name}/package.json`
    //           )
    //             ? fse.readJsonSync(
    //                 `${base_integration_path}${file_name}/package.json`
    //               ).name
    //             : file_name,
    //           version: fs.existsSync(
    //             `${base_integration_path}${file_name}/package.json`
    //           )
    //             ? fse.readJsonSync(
    //                 `${base_integration_path}${file_name}/package.json`
    //               ).version
    //             : "",
    //         };
    //       }
    //     );
    //     const plugins_path = path.normalize(config.pluginsPath + "/");
    //     let file_name_list = _.map(
    //       _.difference(fs.readdirSync(plugins_path), [
    //         "list.json",
    //         "npm_i.sh",
    //         ".DS_Store",
    //       ]),
    //       (file_name) => {
    //         let versionLs = _.difference(
    //           fs.readdirSync(`${plugins_path}${file_name}`),
    //           [".DS_Store"]
    //         ).sort(this.versionFn);
    //         return {
    //           plugin_id: file_name,
    //           plugin_name: fse.readJsonSync(
    //             `${plugins_path}${file_name}/${
    //               versionLs[versionLs.length - 1]
    //             }/package.json`
    //           ).name,
    //           version: versionLs[versionLs.length - 1],
    //         };
    //       }
    //     );
    //     file_name_list = _.concat(file_name_list, base_integration_file_list);
    //     let target_file_name_list = [],
    //       plugin_list = [],
    //       where = {
    //         needs: "last",
    //         pluginNames: _.map(file_name_list, "plugin_name").join(","),
    //       };
    //     pluginViews(where)
    //       .then((result) => {
    //         var webPluginViews = [];
    //         _.map(result.result, (item) => {
    //           let newPluginObj = _.cloneDeep(item);
    //           newPluginObj.plugin_id = item.pluginId;
    //           newPluginObj.plugin_name = item.pluginName;
    //           newPluginObj.isUiautoBaseIntegration =
    //             item.isUiautoBaseIntegration === "true" ? true : false;
    //           delete newPluginObj.pluginId;
    //           delete newPluginObj.pluginName;
    //           webPluginViews.push(newPluginObj);
    //           return item;
    //         });
    //         if (this.searchName !== "") {
    //           _.map(file_name_list, (item) => {
    //             if (item.plugin_name.indexOf(this.searchName) > -1) {
    //               target_file_name_list.push(item);
    //             }
    //           });
    //         } else {
    //           target_file_name_list = file_name_list;
    //         }
    //         _.map(target_file_name_list, (item) => {
    //           var package_json_path = `${plugins_path}${item.plugin_id}/${item.version}/package.json`;
    //           if (!fs.existsSync(package_json_path)) {
    //             package_json_path = `${base_integration_path}/${item.plugin_id}/package.json`;
    //           }
    //           if (fs.existsSync(package_json_path)) {
    //             var package_json = fse.readJsonSync(package_json_path);
    //             var the_plugin = _.find(webPluginViews, function (plugin_item) {
    //               return plugin_item.plugin_id == package_json.id;
    //             });
    //             if (the_plugin) {
    //               plugin_list.push({
    //                 id: the_plugin ? the_plugin.id : null,
    //                 plugin_id: package_json.id,
    //                 pluginName: package_json.name,
    //                 author: package_json.author,
    //                 version: package_json.version,
    //                 language: package_json.language,
    //                 latestVersion: the_plugin
    //                   ? the_plugin.version
    //                   : package_json.version,
    //                 pluginDescription: package_json.description,
    //                 attachmentMd5: the_plugin ? the_plugin.attachmentMd5 : null,
    //                 isUiautoBaseIntegration: the_plugin
    //                   ? the_plugin.isUiautoBaseIntegration
    //                   : false,
    //                 webPlugin: the_plugin ? the_plugin : null,
    //                 isOfficial: the_plugin ? the_plugin.isOfficial : "unknow",
    //                 updateTime: the_plugin
    //                   ? the_plugin.updateTime
    //                     ? the_plugin.updateTime
    //                     : the_plugin.createTime
    //                   : "--",
    //               });
    //               const thePluginStatus = {
    //                 plugin_id: package_json.id,
    //                 version: the_plugin
    //                   ? the_plugin.version
    //                   : package_json.version,
    //                 needUpdate: this.download_plugin[
    //                   `${package_json.id}${
    //                     the_plugin ? the_plugin.version : package_json.version
    //                   }`
    //                 ]
    //                   ? true
    //                   : checkPluginsVersion(
    //                       the_plugin
    //                         ? the_plugin.version
    //                         : package_json.version,
    //                       package_json.version
    //                     )
    //                   ? true
    //                   : false,
    //                 buttonText: this.download_plugin[
    //                   `${package_json.id}${
    //                     the_plugin ? the_plugin.version : package_json.version
    //                   }`
    //                 ]
    //                   ? this.download_plugin[
    //                       `${package_json.id}${
    //                         the_plugin
    //                           ? the_plugin.version
    //                           : package_json.version
    //                       }`
    //                     ]["downloadStatus"] === "exception"
    //                     ? "重新下载"
    //                     : this.download_plugin[
    //                         `${package_json.id}${
    //                           the_plugin
    //                             ? the_plugin.version
    //                             : package_json.version
    //                         }`
    //                       ]["isWaitDownload"] === true
    //                     ? "等待下载"
    //                     : "正在下载"
    //                   : checkPluginsVersion(
    //                       the_plugin
    //                         ? the_plugin.version
    //                         : package_json.version,
    //                       package_json.version
    //                     )
    //                   ? "更新"
    //                   : "已安装",
    //               };
    //               this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
    //             }
    //           }
    //         });
    //         this.list = _.chunk(plugin_list, this.listQuery.pageSize)[
    //           this.listQuery.pageNo - 1
    //         ];
    //         this.total = plugin_list.length;
    //         this.listLoading = false;
    //       })
    //       .catch((err) => {
    //         this.listLoading = false;
    //       });
    //   });
    // },
    getLocalPlugins() {
      this.listLoading = true;
      const base_integration_path = path.normalize(
        path.join(path.resolve(), "/public/base_integration/")
      );
      const base_integration_file_list = _.map(
        _.difference(fs.readdirSync(base_integration_path), [".DS_Store"]),
        (file_name) => {
          return {
            plugin_id: fs.existsSync(
              `${base_integration_path}${file_name}/package.json`
            )
              ? fse.readJsonSync(
                  `${base_integration_path}${file_name}/package.json`
                ).id
              : file_name,
            plugin_name: fs.existsSync(
              `${base_integration_path}${file_name}/package.json`
            )
              ? fse.readJsonSync(
                  `${base_integration_path}${file_name}/package.json`
                ).name
              : file_name,
            version: fs.existsSync(
              `${base_integration_path}${file_name}/package.json`
            )
              ? fse.readJsonSync(
                  `${base_integration_path}${file_name}/package.json`
                ).version
              : "",
          };
        }
      );
      const plugins_path = path.normalize(config.pluginsPath + "/");
      let file_name_list = [];
      _.map(
        _.difference(fs.readdirSync(plugins_path), [
          "list.json",
          "npm_i.sh",
          ".DS_Store",
        ]),
        (file_name) => {
          _.each(
            _.difference(fs.readdirSync(`${plugins_path}${file_name}`), [
              ".DS_Store",
            ]),
            (item) => {
              file_name_list.push({
                plugin_id: file_name,
                plugin_name: fs.existsSync(
                  path.normalize(
                    `${plugins_path}${file_name}/${item}/package.json`
                  )
                )
                  ? fse.readJsonSync(
                      path.normalize(
                        `${plugins_path}${file_name}/${item}/package.json`
                      )
                    ).name
                  : file_name,
                version: item,
              });
            }
          );
        }
      );
      file_name_list = _.concat(file_name_list, base_integration_file_list);
      let target_file_name_list = [],
        plugin_list = [],
        where = {
          needs: "all",
          pluginNames: _.map(file_name_list, "plugin_name").join(","),
        };
      pluginViews(where)
        .then((result) => {
          var webPluginViews = [];
          _.map(result.result, (item) => {
            let newPluginObj = _.cloneDeep(item);
            newPluginObj.plugin_id = item.pluginId;
            newPluginObj.plugin_name = item.pluginName;
            newPluginObj.isUiautoBaseIntegration =
              item.isUiautoBaseIntegration === "true" ? true : false;
            delete newPluginObj.pluginId;
            delete newPluginObj.pluginName;
            webPluginViews.push(newPluginObj);
            return item;
          });
          if (this.searchName !== "") {
            _.map(file_name_list, (item) => {
              if (item.plugin_name.indexOf(this.searchName) > -1) {
                target_file_name_list.push(item);
              }
            });
          } else {
            target_file_name_list = file_name_list;
          }
          let webPluginLs = _.map(webPluginViews, (item) => {
            return {
              plugin_id: item.plugin_id,
              plugin_name: item.plugin_name,
              version: item.version,
            };
          });

          let localPluginLs = _.differenceWith(
            target_file_name_list,
            webPluginLs,
            _.isEqual
          );
          _.map(localPluginLs, (item) => {
            var package_json_path = `${plugins_path}${item.plugin_id}/${item.version}/package.json`;
            if (!fs.existsSync(package_json_path)) {
              package_json_path = `${base_integration_path}/${item.plugin_id}/package.json`;
            }
            if (fs.existsSync(package_json_path)) {
              var package_json = fse.readJsonSync(package_json_path);
              plugin_list.push({
                id: null,
                plugin_id: package_json.id,
                pluginName: package_json.name,
                author: package_json.author,
                version: package_json.version,
                language: this.checkLanguage(package_json.language)
                  ? package_json.language
                  : "unknow",
                pluginDescription: package_json.description,
                isUiautoBaseIntegration: false,
                isOfficial: "unknow",
              });
            }
          });
          this.list = _.chunk(plugin_list, this.listQuery.pageSize)[
            this.listQuery.pageNo - 1
          ];
          this.total = plugin_list.length;
          this.listLoading = false;
        })
        .catch((err) => {
          this.listLoading = false;
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
    checkLanguage(language) {
      if (["nodejs", "python", "java"].includes(language)) {
        return true;
      } else {
        return false;
      }
    },
    deletePlugin(val) {
      this.$confirm("此操作将永久删除该插件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const loading = this.$loading({
            text: "正在删除",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
            target: "#" + val.plugin_id,
          });
          const plugins_path = config.pluginsPath + "/";
          let all_plugins_path = _.difference(fs.readdirSync(plugins_path), [
              "list.json",
            ]),
            delete_path = path.normalize(
              plugins_path +
                all_plugins_path[_.indexOf(all_plugins_path, val.plugin_id)] +
                "/" +
                val.version +
                "/"
            ),
            fPath = path.normalize(
              plugins_path +
                all_plugins_path[_.indexOf(all_plugins_path, val.plugin_id)] +
                "/"
            );
          if (fs.existsSync(delete_path)) {
            try {
              fse.emptyDirSync(delete_path);
              fs.rmdirSync(delete_path);
              let fPathLs = fs.readdirSync(fPath);
              if (fPathLs.length === 0) {
                fse.emptyDirSync(fPath);
                fs.rmdirSync(fPath);
              }
              loading.close();
              this.getList();
              this.$message({
                showClose: true,
                message: "删除成功",
                type: "success",
              });
            } catch (err) {
              loading.close();
              this.$message({
                showClose: true,
                message: err,
                type: "error",
              });
            }
          } else {
            loading.close();
            this.$message({
              showClose: true,
              message: "删除失败，插件已被删除或文件不合法",
              type: "error",
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    handleSeach() {
      this.listQuery = {
        pageNo: 1,
        pageSize: 20,
      };
      this.getList();
    },
    downloadOrUpgrade() {
      this.listLoading = true;
      let pluginList = [];
      let pluginStatusList = [];
      const base_integration_path = path.join(
        path.resolve(),
        "/public/base_integration/"
      );
      const base_integration_file_list = _.map(
        _.difference(fs.readdirSync(base_integration_path), [".DS_Store"]),
        (file_name) => {
          return {
            plugin_id: fs.existsSync(
              `${base_integration_path}${file_name}/package.json`
            )
              ? fse.readJsonSync(
                  `${base_integration_path}${file_name}/package.json`
                ).id
              : file_name,
            version: fs.existsSync(
              `${base_integration_path}${file_name}/package.json`
            )
              ? fse.readJsonSync(
                  `${base_integration_path}${file_name}/package.json`
                ).version
              : "",
          };
        }
      );

      const plugins_path = config.pluginsPath + "/";
      let fileNameList = _.map(
        _.difference(fs.readdirSync(plugins_path), [
          "list.json",
          "npm_i.sh",
          ".DS_Store",
        ]),
        (file_name) => {
          let versionLs = _.difference(
            fs.readdirSync(`${plugins_path}${file_name}`),
            [".DS_Store"]
          ).sort(this.versionFn);
          return {
            plugin_id: file_name,
            version: versionLs[versionLs.length - 1],
          };
        }
      );
      fileNameList = _.concat(fileNameList, base_integration_file_list);

      pluginViews({
        needs: "last",
      }).then((result) => {
        var webPluginViews = [];
        _.map(result.result, (item) => {
          let newPluginObj = _.cloneDeep(item);
          newPluginObj.plugin_id = item.pluginId;
          newPluginObj.isUiautoBaseIntegration =
            item.isUiautoBaseIntegration === "true" ? true : false;
          delete newPluginObj.pluginId;
          webPluginViews.push(newPluginObj);
          return item;
        });
        _.each(webPluginViews, (pluginItem) => {
          var package_json_path = `${config.pluginsPath}/${pluginItem.plugin_id}/${pluginItem.version}/package.json`;
          var base_integration_path = path.join(
            path.resolve(),
            "/public/base_integration/"
          );
          if (!fs.existsSync(package_json_path)) {
            package_json_path = `${base_integration_path}${pluginItem.plugin_id}/package.json`;
          }
          // if (
          //   _.includes(
          //     _.map(base_integration_file_list, "plugin_id"),
          //     pluginItem.plugin_id
          //   )
          // ) {
          //   pluginItem.is_uiauto_base_integration = true;
          // } else {
          //   pluginItem.is_uiauto_base_integration = false;
          // }

          // 本地插件版本
          let localPluginVersion = _.find(fileNameList, {
            plugin_id: pluginItem.plugin_id,
          })
            ? _.find(fileNameList, { plugin_id: pluginItem.plugin_id }).version
            : null;
          let thePluginStatus = {
            plugin_id: pluginItem.plugin_id,
            version: pluginItem.version,
            needUpdate:
              this.searchStatus === "canDownload"
                ? true
                : checkPluginsVersion(
                    pluginItem.version,
                    localPluginVersion ? localPluginVersion : pluginItem.version
                  )
                ? true
                : false,
            buttonText: _.find(fileNameList, {
              plugin_id: pluginItem.plugin_id,
            })
              ? checkPluginsVersion(
                  pluginItem.version,
                  localPluginVersion ? localPluginVersion : pluginItem.version
                )
                ? this.download_plugin[
                    `${pluginItem.plugin_id}${pluginItem.version}`
                  ]
                  ? this.download_plugin[
                      `${pluginItem.plugin_id}${pluginItem.version}`
                    ]["downloadStatus"] === "exception"
                    ? "重新下载"
                    : "更新"
                  : "更新"
                : "已安装"
              : this.download_plugin[
                  `${pluginItem.plugin_id}${pluginItem.version}`
                ]
              ? this.download_plugin[
                  `${pluginItem.plugin_id}${pluginItem.version}`
                ]["downloadStatus"] === "exception"
                ? "重新下载"
                : this.download_plugin[
                    `${pluginItem.plugin_id}${pluginItem.version}`
                  ]["isWaitDownload"] === true
                ? "等待下载"
                : "正在下载"
              : "下载",
          };
          pluginStatusList.push(thePluginStatus);
          this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
        });
        if (this.searchStatus === "canDownload") {
          _.each(pluginStatusList, (statusItem) => {
            if (
              statusItem.buttonText === "下载" ||
              statusItem.buttonText === "重新下载"
            ) {
              let target = _.find(webPluginViews, {
                plugin_id: statusItem.plugin_id,
              });
              if (this.searchName !== "") {
                if (target && target.plugin_id.indexOf(this.searchName) > -1) {
                  pluginList.push({
                    id: target.id,
                    plugin_id: target.plugin_id,
                    pluginName: target.pluginName,
                    author: target.author,
                    version: target.version,
                    latestVersion: target.version,
                    language: this.checkLanguage(target.language)
                      ? target.language
                      : "unknow",
                    pluginDescription: target.pluginDescription,
                    attachmentMd5: target.attachmentMd5,
                    attachmentPath: target.attachmentPath,
                    isUiautoBaseIntegration: target.isUiautoBaseIntegration,
                    isOfficial: target ? target.isOfficial : "unknow",
                    updateTime: target.updateTime
                      ? target.updateTime
                      : target.createTime,
                  });
                }
              } else {
                pluginList.push({
                  id: target.id,
                  plugin_id: target.plugin_id,
                  pluginName: target.pluginName,
                  author: target.author,
                  version: target.version,
                  latestVersion: target.version,
                  language: this.checkLanguage(target.language)
                    ? target.language
                    : "unknow",
                  pluginDescription: target.pluginDescription,
                  attachmentMd5: target.attachmentMd5,
                  attachmentPath: target.attachmentPath,
                  isUiautoBaseIntegration: target.isUiautoBaseIntegration,
                  isOfficial: target ? target.isOfficial : "unknow",
                  updateTime: target.updateTime
                    ? target.updateTime
                    : target.createTime,
                });
              }
            }
          });
        } else if (this.searchStatus === "canUpgrade") {
          _.each(pluginStatusList, (statusItem) => {
            if (statusItem.buttonText === "更新") {
              let target = _.find(webPluginViews, {
                plugin_id: statusItem.plugin_id,
              });
              if (this.searchName !== "") {
                if (target && target.plugin_id.indexOf(this.searchName) > -1) {
                  pluginList.push({
                    id: target.id,
                    plugin_id: target.plugin_id,
                    pluginName: target.pluginName,
                    author: target.author,
                    version: target.version,
                    latestVersion: target.version,
                    language: this.checkLanguage(target.language)
                      ? target.language
                      : "unknow",
                    pluginDescription: target.pluginDescription,
                    attachmentMd5: target.attachmentMd5,
                    attachmentPath: target.attachmentPath,
                    isUiautoBaseIntegration: target.isUiautoBaseIntegration,
                    isOfficial: target ? target.isOfficial : "unknow",
                    updateTime: target.updateTime
                      ? target.updateTime
                      : target.createTime,
                  });
                }
              } else {
                pluginList.push({
                  id: target.id,
                  plugin_id: target.plugin_id,
                  pluginName: target.pluginName,
                  author: target.author,
                  version: target.version,
                  latestVersion: target.version,
                  language: this.checkLanguage(target.language)
                    ? target.language
                    : "unknow",
                  pluginDescription: target.pluginDescription,
                  attachmentMd5: target.attachmentMd5,
                  attachmentPath: target.attachmentPath,
                  isUiautoBaseIntegration: target.isUiautoBaseIntegration,
                  isOfficial: target ? target.isOfficial : "unknow",
                  updateTime: target.updateTime
                    ? target.updateTime
                    : target.createTime,
                });
              }
            }
          });
        }
        this.list = _.chunk(pluginList, this.listQuery.pageSize)[
          this.listQuery.pageNo - 1
        ];
        this.listLoading = false;
        this.total = pluginList.length;
      });
    },
    showHistoryPlugin(plugin) {
      this.$refs["historyPlugin"].show(plugin);
    },
    handleAllDownload() {
      this.$store.commit("plugin/ALL_PLUGIN_DOWNLOADING", true);
      this.getAllDownloadParams();
    },
    handleUploadPlugin() {
      this.$refs["uploadPlugin"] && this.$refs["uploadPlugin"].show();
    },
    handleCompressionPlugin() {
      this.$refs["compressionPlugin"] && this.$refs["compressionPlugin"].show();
    },
    handleFilter() {
      this.listQuery = {
        pageNo: 1,
        pageSize: 20,
      };
      this.total = 0;
      this.getList();
    },
    getPercent(num, total) {
      num = parseFloat(num);
      total = parseFloat(total);
      return total <= 0
        ? parseFloat(0)
        : Math.round((num / total) * 10000) / 100.0;
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep .el-button + .el-button {
  margin-left: 0px;
}
::v-deep .el-input__inner {
  height: 32px;
}
::v-deep .el-progress-bar {
  width: 95%;
}
::v-deep .el-progress__text {
  width: 5%;
}
::v-deep .el-button.is-loading:before {
  background-color: rgb(0 0 0 / 0%);
}
.allDownloadStatus {
  float: left;
  margin-top: 6px;
  margin-left: 30px;
  height: 30px;
  display: inline;
  width: 400px;
  .downloaded {
    font-size: 14px;
    color: #606266;
    margin-right: 6px;
    float: left;
  }
  .downloading {
    font-size: 14px;
    color: #606266;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 200px;
  }
}
.suButton {
  color: #67c23a;
  width: 75px;
}
.erButton {
  color: #f56c6c;
  width: 75px;
}
.inButton {
  color: #909399;
  width: 75px;
}
.plButton {
  color: #409eff;
  width: 75px;
}
</style>


