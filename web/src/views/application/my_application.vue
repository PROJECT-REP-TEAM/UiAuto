<template>
  <div style="background: #fff">
    <el-table v-loading="loading" border :data="dataSource">
      <el-table-column type="index" align="center" width="50" />
      <el-table-column
        prop="projectName"
        align="center"
        label="项目标识"
        show-overflow-tooltip
      />
      <el-table-column
        prop="name"
        align="center"
        label="项目名称"
        show-overflow-tooltip
      />
      <el-table-column
        prop="latestVersion"
        align="center"
        label="最新版本号"
        show-overflow-tooltip
      />
      <el-table-column
        prop="author"
        align="center"
        label="项目作者"
        show-overflow-tooltip
      />
      <el-table-column
        prop="uploader"
        align="center"
        label="上传者"
        show-overflow-tooltip
      />
      <el-table-column
        prop="remark"
        align="center"
        label="备注"
        show-overflow-tooltip
      />
      <el-table-column fixed="right" align="center" label="操作" width="340">
        <template slot-scope="scope">
          <el-button
            type="text"
            style="width: 60px"
            @click="handleExecute(scope.row)"
            >立即执行</el-button
          >
          <el-button
            type="text"
            icon="el-icon-loading"
            style="color: #909399; width: 60px"
            v-if="stateFn(scope.row) == 'install'"
            >检测中</el-button
          >
          <el-button
            type="text"
            style="width: 60px"
            v-if="!disabledFn(scope.row)"
            @click="handleDependencyDetection(scope.row)"
            >依赖检测</el-button
          >

          <el-button
            type="text"
            @click="handlePreview(scope.row)"
            style="width: 40px"
            >预览</el-button
          >

          <el-button
            type="text"
            style="width: 40px"
            :disabled="stateFn(scope.row) == 'install'"
            @click="handleCancleCollect(scope.row)"
            >删除</el-button
          >

          <el-popover
            placement="top-start"
            width="200"
            trigger="hover"
            v-if="stateFn(scope.row) == 'pass'"
          >
            <el-button
              type="primary"
              size="mini"
              @click="handleDependencyDetection(scope.row, 'again')"
              >重新检测</el-button
            >
            <el-button
              type="text"
              icon="el-icon-success"
              style="color: #67c23a; width: 20px"
              slot="reference"
            ></el-button>
          </el-popover>

          <el-popover
            placement="top-start"
            width="200"
            trigger="hover"
            v-if="stateFn(scope.row) == 'unpass'"
          >
            <p>{{ messageFn(scope.row) }}</p>
            <el-button
              type="primary"
              size="mini"
              @click="handleDependencyDetection(scope.row, 'again')"
              >重新检测</el-button
            >
            <el-button
              type="text"
              icon="el-icon-circle-close"
              style="color: #f56c6c; width: 20px"
              slot="reference"
            ></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageNo"
      :limit.sync="pageSize"
      @pagination="getTableData"
    />

    <uiautoPreview ref="uiauto-preview" />

    <el-dialog
      title="执行时参数"
      :visible.sync="dialogFormVisible"
      @closed="reset"
    >
      <el-form label-width="100px">
        <el-form-item
          v-for="(item, index) in execute_params"
          :key="index"
          :label="item.keyName"
        >
          <el-input
            v-model.trim="item.value"
            :placeholder="'请输入' + item.keyName"
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="reset">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">执 行</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import { getStoreList, cancleCollect } from "@/api/application";
import { getCloudProjects } from "@/api/plugin";
import uiautoPreview from "./uiauto-preview";
import Pagination from "@/components/Pagination";
import config from "@/config/environment/index";
import { updateLog } from "@/api/task";
const socket = require("../../express/socket/client");
const electron = require("../../utils/electron");
const fs = window.nodeRequire("fs");
const fse = window.nodeRequire("fs-extra");
const os = window.nodeRequire("os");
const path = window.nodeRequire("path");
const {
  currentExecutionList,
  dependencyDetection,
  syncStore,
} = require("../../utils/dependency-detection");

export default {
  name: "MyApplication",
  components: { uiautoPreview, Pagination },
  data() {
    return {
      visible: false,
      loading: false,
      dialogFormVisible: false,
      dataSource: [],
      total: 0,
      pageNo: 1,
      pageSize: 10,
      execute_params: [],
      currentJson: {},
      // 当前依赖检测的列表
      current_execution_list: currentExecutionList(),
    };
  },
  props: {},
  created() {
    this.syncStoreFn();
  },
  computed: {},
  methods: {
    getLocalStoreList() {
      let projectLs = [];
      let files = _.difference(fs.readdirSync(`${config.storePath}/`), [
        ".DS_Store",
      ]);
      files.forEach(function (fileName, index) {
        if (fs.statSync(`${config.storePath}/${fileName}`).isDirectory()) {
          let json = fse.readJsonSync(
            `${config.storePath}/${fileName}/${fileName}.json`
          );
          if (json.project_type != "folder") {
            projectLs.push({
              name: json.name,
              json: json,
              projectName: json.project_name,
            });
          }
        }
      });
      return projectLs;
    },
    syncStoreFn() {
      this.$parent.syncLoading = true;

      getCloudProjects({
        type: "store",
      })
        .then((getCloudProjectsRes) => {
          if (getCloudProjectsRes.success) {
            syncStore(
              _.differenceBy(
                getCloudProjectsRes.result.data,
                this.getLocalStoreList(),
                "projectName"
              )
            ).then((res) => {
              this.$parent.syncLoading = false;
              this.getTableData();
            });
          } else {
            this.$parent.syncLoading = false;
            this.$message.error(getCloudProjectsRes.message);
          }
        })
        .catch((err) => {
          this.$parent.syncLoading = false;
        });
    },
    getTableData() {
      this.loading = true;
      getStoreList({
        optType: "store",
        status: "public",
        column: "createTime",
        order: "desc",
        pageNo: this.pageNo,
        pageSize: this.pageSize,
      }).then((getProjectNameRes) => {
        this.loading = false;
        if (getProjectNameRes.result.records.length) {
          this.dataSource = getProjectNameRes.result.records;
          this.total = getProjectNameRes.result.total;
        } else {
          this.dataSource = [];
        }
      });
    },
    handleCommand(command) {
      this.$message("click on item " + command);
    },
    // 预览
    handlePreview(row) {
      this.$refs["uiauto-preview"].show(row.projectName);
    },
    // 立即执行
    handleExecute(row) {
      this.currentJson = fse.readJsonSync(
        `${config.storePath}/${row.projectName}/${row.projectName}.json`
      );
      if (this.currentJson.isExecuteParams) {
        this.dialogFormVisible = true;
        this.execute_params = _.cloneDeep(this.currentJson.execute_params);
      } else {
        this.execute(row);
      }
    },
    handleConfirm() {
      if (
        _.compact(_.map(this.execute_params, "key")).length !=
        _.compact(_.map(this.execute_params, "value")).length
      ) {
        return this.$message.error("存在未填写值");
      }
      // 先保存json文件
      let fileJsonPath = `${config.storePath}/${this.currentJson.project_name}/${this.currentJson.project_name}.json`;
      let json = fse.readJsonSync(`${fileJsonPath}`);
      json["execute_params"] = this.execute_params;
      fs.writeFileSync(
        `${fileJsonPath}`,
        JSON.stringify(json, null, "\t"),
        "utf8"
      );
      this.currentJson = json;
      this.dialogFormVisible = false;
      // running
      this.execute({ projectName: this.currentJson.project_name });
    },
    reset() {
      this.dialogFormVisible = false;
      this.execute_params = [];
    },
    stateFn(row) {
      let target = _.find(this.current_execution_list, {
        name: row.name,
        project_name: row.projectName,
      });
      if (target) {
        return target.result;
      } else {
        return false;
      }
    },
    messageFn(row) {
      let target = _.find(this.current_execution_list, {
        name: row.name,
        project_name: row.projectName,
      });
      if (target) {
        return target.message;
      }
    },
    disabledFn(row) {
      let target = _.find(this.current_execution_list, {
        name: row.name,
        project_name: row.projectName,
      });
      if (target) {
        return true;
      } else {
        return false;
      }
    },
    async handleDependencyDetection(row, type) {
      this.visible = false;
      let json = row
        ? fse.readJsonSync(
            `${config.storePath}/${row.projectName}/${row.projectName}.json`
          )
        : this.currentJson;
      await dependencyDetection(row.id, json, type).then((res) => {
        this.current_execution_list = res;
      });
    },
    // 执行
    execute(row) {
      if (this.$store.state.socket.actuatorStatus != "running") {
        // 执行前先依赖检测
        this.handleDependencyDetection(row).then(() => {
          if (
            _.find(this.current_execution_list, {
              project_name: this.currentJson.project_name,
            }).result == "pass"
          ) {
            electron.window_minimize();

            let browser_info = {};
            const browser_info_path = path.normalize(
              `${os.homedir()}/.uiauto/browser.json`
            );
            if (fs.existsSync(browser_info_path)) {
              browser_info = JSON.parse(fs.readFileSync(browser_info_path));
            }

            this.$store.commit("socket/ACTUATOR_STATUS", {
              actuatorStatus: "running",
            });
            window["executor"]
              .execute(
                this.currentJson.project_name,
                _.assign(
                  {
                    projectsPath: "store",
                    uiauto_browser: browser_info,
                    uiauto_task_id: null,
                  },
                  _.zipObject(
                    _.map(this.currentJson.global_variable, "key"),
                    _.map(this.currentJson.global_variable, "value")
                  ),
                  _.zipObject(
                    _.map(this.currentJson.execute_params, "key"),
                    _.map(this.currentJson.execute_params, "value")
                  )
                ),
                {
                  newCB: (newLogs) => {},
                  updateLog: updateLog,
                  socket_client: socket.getSocketClient(),
                }
              )
              .then((res) => {
                console.log("-=-=-=执行成功-=-=-=-=", res);
                this.$store.commit("socket/ACTUATOR_STATUS", {
                  actuatorStatus: "free",
                });
                electron.window_maximize();
                this.currentJson = {};
              })
              .catch((err) => {
                console.log("-=-=-=执行出错-=-=-=-=", err);
                this.$store.commit("socket/ACTUATOR_STATUS", {
                  actuatorStatus: "free",
                });
                electron.window_maximize();
                this.$message.warning("执行出错");
                this.currentJson = {};
              });
          } else {
            this.$message.warning(
              "依赖检测未通过，未能正常执行应用，请排查对应插件安装情况！"
            );
          }
        });
      } else {
        this.$message.warning(
          "有任务正在执行，请等待任务完成后或者停止当前任务再执行"
        );
      }
    },
    // 取消收藏
    handleCancleCollect(row) {
      this.visible = false;
      cancleCollect({ id: row.id }).then((res) => {
        if (res.success) {
          this.$message.success("删除成功");
          this.getTableData();
          // 删除本地文件
          this.handleDeleteFolder(`${config.storePath}/${row.projectName}`);
          // 删除依赖安装列表
          _.remove(this.current_execution_list, (item) => {
            return item.project_name == row.projectName;
          });
        }
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
    },
  },
};
</script>

<style lang="scss" scoped>
.el-button + .el-button {
  margin-left: 0;
}

::v-deep .el-button [class*="el-icon-"] + span {
  margin-left: 2px;
}
</style>
