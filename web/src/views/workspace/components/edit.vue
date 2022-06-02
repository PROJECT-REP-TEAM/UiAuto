<template>
  <div>
    <el-dialog
      title="编辑操作"
      :visible.sync="showDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      @closed="reset"
    >
      <div style="position: absolute; right: 10px; top: 12px">
        <el-button
          style="width: 80px; height: 32px; line-height: 7px"
          type="primary"
          @click="handleExport"
          >导出</el-button
        >
        <el-popover placement="top" width="160" v-model="visible">
          <p>确定发布版本吗？</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="visible = false"
              >取消</el-button
            >
            <el-button type="primary" size="mini" @click="handleRelease"
              >确定</el-button
            >
          </div>
          <el-button
            type="primary"
            style="height: 32px; line-height: 7px"
            slot="reference"
            >发布版本</el-button
          >
        </el-popover>
        <el-button
          type="danger"
          style="width: 80px; height: 32px; line-height: 7px"
          @click="handleDelete()"
          >删除</el-button
        >
      </div>
      <el-row :gutter="20">
        <el-col :span="8" class="title-name" style="line-height: 32px"
          >项目名称</el-col
        >
        <el-col :span="16">
          <el-input v-model.trim="form.name" placeholder="请输入项目名称" />
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 10px">
        <el-col :span="8" class="title-name" style="line-height: 32px"
          >开启执行规则</el-col
        >
        <el-col :span="16">
          <el-switch
            v-model="cronOpen"
            active-text="是"
            inactive-text="否"
            style="float: left; height: 32px"
          />
        </el-col>
      </el-row>

      <div v-if="cronOpen" :gutter="20">
        <el-row v-if="cronOpen" :gutter="20" style="margin-top: 10px">
          <el-col :span="8" class="title-name" style="line-height: 32px"
            >执行规则</el-col
          >
          <el-col :span="16">
            <cron v-if="showCronBox" v-model="form.cron" />
            <el-input
              v-model="form.cron"
              auto-complete="off"
              readonly
              placeholder="请输入定时策略"
            >
              <el-button
                v-if="!showCronBox"
                slot="append"
                icon="el-icon-arrow-up"
                title="打开图形配置"
                @click="showCronBox = true"
              />
              <el-button
                v-else
                slot="append"
                icon="el-icon-arrow-down"
                title="关闭图形配置"
                @click="showCronBox = false"
              />
            </el-input>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 10px">
          <el-col :span="8" class="title-name" style="line-height: 32px"
            >重试(次)</el-col
          >
          <el-col :span="16">
            <el-input
              v-model="form.retry_count"
              placeholder="请输入重试次数"
              type="number"
            />
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 10px">
          <el-col :span="8" class="title-name" style="line-height: 32px"
            >重试间隔(毫秒)</el-col
          >
          <el-col :span="16">
            <el-input
              v-model="form.retry_interval"
              placeholder="请输入重试时间"
              type="number"
            />
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 10px">
          <el-col :span="8" class="title-name" style="line-height: 32px"
            >超时时间(毫秒)</el-col
          >
          <el-col :span="16">
            <el-input
              v-model="form.time_out"
              placeholder="请输入超时时间"
              type="number"
            />
          </el-col>
        </el-row>
      </div>
      <el-row :gutter="20" style="margin-top: 10px">
        <el-col :span="8" class="title-name" style="line-height: 32px"
          >执行时传参</el-col
        >
        <el-col :span="16">
          <el-switch
            v-model="executeParamsOpen"
            active-text="是"
            inactive-text="否"
            style="float: left; height: 32px"
            @change="executeParamsFn"
          />
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 10px">
        <el-col :span="8" class="title-name" style="line-height: 32px"
          >开启录屏</el-col
        >
        <el-col :span="16">
          <el-switch
            v-model="recordOpen"
            active-text="是"
            inactive-text="否"
            style="float: left; height: 32px"
          />
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 10px" v-if="recordOpen">
        <el-col :span="8" class="title-name" style="line-height: 32px"
          >录屏存放路径</el-col
        >
        <el-col :span="16">
          <el-input
            v-model="recordFilePath"
            type="text"
            :disabled="true"
            placeholder="请选择插件路径"
            style="width: 84%"
          />
          <el-button
            type="primary"
            size="mini"
            style="width: 15%; float: right; margin-top: 1.5px"
            @click="openFileDialog()"
          >
            <i class="el-icon-folder-opened" />
          </el-button>
        </el-col>
      </el-row>
      <div style="margin-top: 10px; text-align: center">
        <el-button
          type="primary"
          style="width: 80px; height: 32px; line-height: 7px"
          @click="commitEdit()"
          >确定</el-button
        >
        <el-button
          style="
            width: 80px;
            height: 32px;
            line-height: 7px;
            color: #1890ff;
            border: 1px solid #1890ff;
          "
          @click="showDialog = false"
          >取消</el-button
        >
      </div>
    </el-dialog>
    <el-dialog
      title="执行时传参"
      :visible.sync="globalVariableDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="40%"
      top="2vh"
      @close="handleCloseGlobalVariableDialog"
    >
      <el-button size="mini" type="primary" @click="addExecuteParams"
        >新 增</el-button
      >
      <div style="height: 20vh; overflow: scroll">
        <div
          v-for="(row, index) in execute_params"
          :key="index"
          style="margin: 10px 0"
        >
          <el-input
            v-model.trim="row.key"
            class="filter-item"
            style="width: 150px"
            size="mini"
            placeholder="标识"
          />

          <el-input
            v-model.trim="row.keyName"
            placeholder="属性名"
            size="mini"
            style="width: 200px"
            :type="row.type"
          />

          <el-button
            size="mini"
            :icon="
              checkNewExtendEl(row) ? 'el-icon-delete' : 'el-icon-circle-close'
            "
            @click="handleDeleteByExecuteParams(index)"
          />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseGlobalVariableDialog">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const fs = window.nodeRequire("fs");
const fse = window.nodeRequire("fs-extra");
const { fileSelector } = require("@/utils/electron.js");
import _ from "lodash";
import moment from "moment";
import cron from "./cron";
import environment from "@/config/environment";
import config from "@/config/environment/index";
import * as schedule from "../../../schedule";
import axios from "axios";
import $http from "@/api/global/http-client";

export default {
  name: "Edit",
  components: {
    cron,
  },
  data() {
    return {
      visible: false,
      showDialog: false,
      cronOpen: true,
      executeParamsOpen: false,
      recordOpen: false,
      recordFilePath: "",
      showCronBox: false,
      propProjectName: "",
      readJson: "",
      form: {
        project_name: "",
        name: "",
        cron: "",
        retry_count: 0,
        retry_interval: 0,
        time_out: 0,
      },
      folderName: "",
      uploadUrl: "/uiauto/script/importZip",
      headers: {
        "X-Access-Token": localStorage.getItem("uiauto_access_token"),
      },
      globalVariableDialog: false,
      execute_params: [],
    };
  },
  computed: {},
  mounted() {},
  methods: {
    show(params, folder_name) {
      this.readJson = params.json;
      this.showDialog = true;
      this.cronOpen = !!params.json.cron;
      this.executeParamsOpen = !!params.json.isExecuteParams;
      this.recordOpen = !!params.json.automatic_recording;
      this.recordFilePath = params.json.record_file_path || "";
      this.form = {
        project_name: params.json.project_name,
        name: params.json.name,
        cron: params.json.cron || "",
        retry_count: params.json.retry_count || 0,
        retry_interval: params.json.retry_interval || 0,
        time_out: params.json.time_out || 0,
      };
      this.folderName = folder_name;
      this.execute_params = params.json.execute_params || [];
    },
    reset() {
      this.showDialog = false;
      this.cronOpen = true;
      this.executeParamsOpen = false;
      this.recordOpen = false;
      this.recordFilePath = "";
      this.showCronBox = false;
      this.form = {
        project_name: "",
        name: "",
        cron: "",
        retry_count: 0,
        retry_interval: 0,
        time_out: 0,
      };
      this.folderName = "";
    },
    openFileDialog() {
      fileSelector({ properties: ["openDirectory"] }).then((result) => {
        if (Array.isArray(result) && result.length) {
          this.recordFilePath = result[0];
        }
      });
    },
    commitEdit() {
      let old_name = _.cloneDeep(this.readJson["name"]);
      this.form.name = this.form.name.replace(/\//g, "").replace(/\\/g, "");
      if (!this.form.name) {
        return this.$message.warning("项目名称不能为空");
      }
      if (!this.cronOpen) {
        this.form.cron = "";
      }
      if (this.cronOpen && !this.cron) {
        this.cronOpen = false;
      }
      if (this.form.cron === "* * * * * *") {
        return this.$message.warning("cron不能设置为每秒执行");
      }
      this.readJson["automatic_recording"] = this.recordOpen;
      this.readJson["record_file_path"] = this.recordOpen ? this.recordFilePath : "";
      this.readJson["isExecuteParams"] = this.executeParamsOpen;
      if (!this.readJson["isExecuteParams"]) {
        delete this.readJson["execute_params"];
      } else {
        this.readJson["execute_params"] = this.execute_params;
      }
      _.each(
        ["cron", "retry_count", "retry_interval", "time_out", "updateAt"],
        (item) => {
          if (item === "updateAt") {
            this.readJson[item] = moment().format("YYYY-MM-DD HH:mm:ss");
          } else {
            if (item !== "cron") {
              this.readJson[item] = _.toNumber(this.form[item]);
            } else {
              this.readJson[item] = this.form[item];
            }
          }
        }
      );

      if (this.form.retry_count < 0) {
        return this.$message.warning("重试次数不能不小于零！");
      }
      if (this.form.retry_interval < 0) {
        return this.$message.warning("重试间隔时间不能不小于零！");
      }
      if (this.form.time_out < 0) {
        return this.$message.warning("超时时间不能不小于零！");
      }

      this.readJson["name"] = this.form.name;
      fse.writeFileSync(
        `${config.projectsPath}/${this.form.project_name}/${this.form.project_name}.json`,
        JSON.stringify(this.readJson, null, "\t"),
        "utf8"
      );
      this.showDialog = false;
      this.$message.success("修改成功");

      if (this.folderName && this.folderName != "未分类") {
        let json = fse.readJsonSync(
          `${config.projectsPath}/${this.folderName}/${this.folderName}.json`
        );

        json["projects_name"].splice(
          json["projects_name"].indexOf(old_name),
          1
        );

        json["projects_name"].push(this.form.name);

        json["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
        fse.writeFileSync(
          `${config.projectsPath}/${this.folderName}/${this.folderName}.json`,
          JSON.stringify(json, null, "\t"),
          "utf8"
        );
      }

      this.$parent.getProjectList();

      if (this.form.cron) {
        schedule.startJob({
          project_name: this.form.project_name,
          name: this.form.name,
          cron: this.form.cron,
          retry_count: this.form.retry_count,
          retry_interval: this.form.retry_interval,
          time_out: this.form.time_out,
        });
      } else {
        schedule.stopJob(this.form.project_name);
      }
    },
    handleDelete() {
      this.$confirm(
        `确认删除 ${this.folderName} -- ${this.form.project_name} 项目？`,
        "提示",
        {
          type: "warning",
        }
      )
        .then(() => {
          this.$parent.handleDeleteFolder(
            `${config.projectsPath}/${this.form.project_name}`
          );
          if (this.folderName && this.folderName != "未分类") {
            let json = fse.readJsonSync(
              `${config.projectsPath}/${this.folderName}/${this.folderName}.json`
            );
            _.remove(json["projects"], (item) => {
              return item == this.form.project_name;
            });

            let index = json["projects_name"].indexOf(this.form.name);
            json["projects_name"].splice(index, 1);

            json["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
            fse.writeFileSync(
              `${config.projectsPath}/${this.folderName}/${this.folderName}.json`,
              JSON.stringify(json, null, "\t"),
              "utf8"
            );
          }
          this.showDialog = false;
        })
        .catch(() => {});
    },
    handleExport() {
      this.$parent.download(this.readJson, "download");
    },
    handleRelease() {
      this.visible = false;
      this.$parent.download(this.readJson, "upload").then((res) => {
        const file = fs.readFileSync(res);

        // Buffer 转 ArrayBuffer
        var ab = new ArrayBuffer(file.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < file.length; ++i) {
          view[i] = file[i];
        }

        let formData = new FormData();
        formData.append("biz", "zip_temp");
        formData.append("category", "uiauto");
        // ArrayBuffer 转 Blob
        formData.append(
          "file",
          new Blob([ab]),
          `${this.readJson.project_name}.zip`
        );

        $http
          .post(this.uploadUrl, formData)
          .then((res) => {
            if (res.success) {
              this.$message.success("发布成功");
              this.showDialog = false;
            } else {
              this.$message.error(res.message);
            }
          })
          .catch((error) => {
            this.$message.error(error);
          });
      });
    },
    executeParamsFn(value) {
      this.globalVariableDialog = value;
    },
    handleCloseGlobalVariableDialog() {
      this.globalVariableDialog = false;
      _.remove(this.execute_params, (item) => {
        return !item.key || !item.keyName;
      });
      if (!this.execute_params.length) {
        this.executeParamsOpen = false;
      }
    },
    checkNewExtendEl(row) {
      return row.key && row.type && row.value;
    },
    handleDeleteByExecuteParams(index) {
      this.execute_params.splice(index, 1);
    },
    addExecuteParams() {
      if (
        _.find(this.execute_params, { key: "" }) ||
        _.find(this.execute_params, { keyName: "" })
      ) {
        return this.$message.error("存在未填写值");
      }
      this.execute_params.push({
        key: "",
        keyName: "",
        value: "",
      });
    },
    handleConfirm() {
      if (
        _.uniq(_.map(this.execute_params, "key")).length !=
        this.execute_params.length
      ) {
        return this.$message.error("存在相同属性名");
      }
      if (
        _.find(this.execute_params, {
          key: "",
        }) ||
        _.find(this.execute_params, {
          keyName: "",
        })
      ) {
        return this.$message.error("存在未填写值");
      }
      if (!this.execute_params.length) {
        this.executeParamsOpen = false;
      }
      this.globalVariableDialog = false;
      console.log("this.execute_params", this.execute_params);
    },
  },
};
</script>

<style lang="scss" scoped>
.el-button + .el-button {
  margin-left: 0;
}
</style>
