<template>
  <div>
    <el-dialog
      width="50%"
      title="历史版本"
      :visible.sync="showDialogHistory"
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @closed="cancel"
    >
      <el-table
        :key="historyTableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column
          label="插件名称"
          width="150px"
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
        <el-table-column label="插件描述" width="200px" show-overflow-tooltip>
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
        <el-table-column
          label="操作"
          align="center"
          min-width="100"
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
              :class="
                plugin_status[`${row.plugin_id}${row.version}`] &&
                plugin_status[`${row.plugin_id}${row.version}`].needUpdate
                  ? 'suButton'
                  : 'inButton'
              "
              type="text"
              :disabled="
                !plugin_status[`${row.plugin_id}${row.version}`].needUpdate
              "
              :loading="
                download_plugin[`${row.plugin_id}${row.version}`]
                  ? download_plugin[`${row.plugin_id}${row.version}`]
                      .isDownloading
                  : false
              "
              style="cursor: pointer"
              @click="downloadHistoryPlugin(row)"
              >{{
                plugin_status[`${row.plugin_id}${row.version}`].buttonText
              }}</el-button
            >
            <el-button
              type="text"
              class="erButton"
              v-if="
                row.isUiautoBaseIntegration
                  ? !row.isUiautoBaseIntegration
                  : plugin_status[`${row.plugin_id}${row.version}`]
                      .needUpdate === false
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
    </el-dialog>
  </div>
</template>

<script>
const os = window.nodeRequire("os");
const fs = window.nodeRequire("fs");
const path = window.nodeRequire("path");
const fse = window.nodeRequire("fs-extra");
import _ from "lodash";
import config from "@/config/environment/index";
var { executeDownload } = require("@/utils/electron.js");
import { historyPluginList } from "@/api/plugin";
import Pagination from "@/components/Pagination";

export default {
  name: "HistoryPlugin",
  components: { Pagination },
  data() {
    return {
      historyTableKey: 0,
      total: 0,
      listLoading: true,
      list: [],
      listQuery: {
        pageNo: 1,
        pageSize: 10,
      },
      lastVersionPlugin: "",
      showDialogHistory: false,
    };
  },
  filters: {
    languageFilter(language) {
      const languageMap = {
        nodejs: "fa-brands fa-node-js",
        python: "fa-brands fa-python",
        java: "fa-brands fa-java",
      };
      return languageMap[language];
    },
  },
  computed: {
    download_plugin() {
      return this.$store.state.plugin.pluginDownload;
    },
    plugin_status() {
      return this.$store.state.plugin.pluginStatus;
    },
    history_plugin_refresh() {
      return this.$store.state.plugin.historyPluginRefresh;
    },
  },
  watch: {
    history_plugin_refresh: function (newVal, oldVal) {
      this.getHistoryPluginList(this.lastVersionPlugin);
    },
  },
  mounted() {},
  methods: {
    // 创建项目文件夹
    show(plugin) {
      this.showDialogHistory = true;
      this.lastVersionPlugin = plugin;
      this.getHistoryPluginList(plugin);
    },
    getList() {
      this.getHistoryPluginList(this.lastVersionPlugin);
    },
    getHistoryPluginList(plugin) {
      let sqp = {},
        fileNameList = [];
      const base_integration_path = path.join(
        path.resolve(),
        "/public/base_integration/"
      );
      const plugins_path = path.normalize(
        `${config.pluginsPath}/${plugin.plugin_id}/`
      );
      if (plugin.isUiautoBaseIntegration) {
        fileNameList.push({
          plugin_id: fs.existsSync(
            path.normalize(
              `${base_integration_path}${plugin.plugin_id}/package.json`
            )
          )
            ? fse.readJsonSync(
                path.normalize(
                  `${base_integration_path}${plugin.plugin_id}/package.json`
                )
              ).id
            : plugin.plugin_id,
          version: fs.existsSync(
            path.normalize(
              `${base_integration_path}${plugin.plugin_id}/package.json`
            )
          )
            ? fse.readJsonSync(
                path.normalize(
                  `${base_integration_path}${plugin.plugin_id}/package.json`
                )
              ).version
            : "",
        });
      } else {
        if (fs.existsSync(plugins_path)) {
          fileNameList = _.map(
            _.difference(fs.readdirSync(plugins_path), [
              "list.json",
              "npm_i.sh",
              ".DS_Store",
            ]),
            (file_name) => {
              return {
                plugin_id: fs.existsSync(
                  path.normalize(`${plugins_path}${file_name}/package.json`)
                )
                  ? fse.readJsonSync(
                      path.normalize(`${plugins_path}${file_name}/package.json`)
                    ).id
                  : plugin.plugin_id,
                version: fs.existsSync(
                  path.normalize(`${plugins_path}${file_name}/package.json`)
                )
                  ? fse.readJsonSync(
                      path.normalize(`${plugins_path}${file_name}/package.json`)
                    ).version
                  : "",
              };
            }
          );
        }
      }
      let queryParams = [
        {
          rule: "eq",
          type: "string",
          dictCode: "",
          val: plugin.plugin_id,
          field: "pluginId",
        },
      ];
      /* 排序参数 */
      let isorter = {
        column: 'createTime',
        order: 'desc',
      };
      sqp["superQueryParams"] = encodeURI(JSON.stringify(queryParams));
      sqp["superQueryMatchType"] = "and";
      historyPluginList(Object.assign(sqp, isorter, this.listQuery))
        .then((result) => {
          var historyPluginList = [];
          _.map(result.result.records, (item) => {
            let newPluginObj = _.cloneDeep(item);
            newPluginObj.plugin_id = item.pluginId;
            newPluginObj.isUiautoBaseIntegration =
              item.isUiautoBaseIntegration === "true" ? true : false;
            delete newPluginObj.pluginId;
            historyPluginList.push(newPluginObj);
            return item;
          });
          _.map(historyPluginList, (thePlugin) => {
            let target = _.find(fileNameList, {
              plugin_id: thePlugin.plugin_id,
              version: thePlugin.version,
            });
            if (target) {
              let package_json_path = "";
              if (plugin.isUiautoBaseIntegration) {
                package_json_path = path.normalize(
                  `${base_integration_path}${thePlugin.plugin_id}/package.json`
                );
              } else {
                package_json_path = path.normalize(
                  `${plugins_path}${thePlugin.version}/package.json`
                );
              }
              if (fs.existsSync(package_json_path)) {
                const thePluginStatus = {
                  plugin_id: thePlugin.plugin_id,
                  version: thePlugin.version,
                  needUpdate: false,
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
                    : "已安装",
                };
                this.$store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
              } else {
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
          this.list = historyPluginList;
          this.total = result.result.total;
          this.listLoading = false;
        })
        .catch((err) => {
          this.listLoading = false;
        });
    },
    async downloadHistoryPlugin(plugin) {
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
      //   if (this.$store.state.plugin.has_python_downloading) {
      //     this.$message({
      //       message: "当前已有python插件在下载，请稍候再下载！",
      //       type: "error",
      //     });
      //     return false;
      //   } else {
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
          this.$store.dispatch("plugin/refreshPugin");
          this.$store.dispatch("plugin/refreshHistoryPugin");
        })
        .catch((err) => {});
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
              this.getHistoryPluginList(this.lastVersionPlugin);
              this.$store.dispatch("plugin/refreshPugin");
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
    cancel() {
      this.showDialogHistory = false;
      this.total = 0;
      this.list = [];
      this.listQuery = {
        pageNo: 1,
        pageSize: 10,
      };
      this.lastVersionPlugin = "";
    },
  },
};
</script>

<style scoped>
::v-deep .el-button + .el-button {
  margin-left: 0px;
}
::v-deep .el-button.is-loading:before {
  background-color: rgb(0 0 0 / 0%);
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
