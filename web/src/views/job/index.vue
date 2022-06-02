<template>
  <div>
    <div class="app-actionBar">
      <div class="left-menu">任务列表</div>

      <div>
        <div class="action-button">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="handleFilter()"
            >搜索</el-button
          >
        </div>
        <div class="header-search">
          <el-input
            v-model="listQuery.project_name"
            placeholder="任务名称"
            class="header-search-select"
            @keyup.enter.native="handleFilter()"
          />

          <el-select
            v-model="listQuery.status"
            class="header-search-select"
            placeholder="任务状态"
            @change="handleFilter()"
          >
            <div v-if="selectedTab === 'local'">
              <el-option
                v-for="item in localSortOptions"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              />
            </div>
            <div v-else>
              <el-option
                v-for="item in sortOptions"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              />
            </div>
          </el-select>
          <el-date-picker
            v-model="listQuery.createdAt"
            class="header-search-select"
            style="width: 380px; display: inline-flex"
            type="datetimerange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </div>
      </div>
    </div>
    <div class="app-container">
      <el-tabs v-model="selectedTab" style="background: #fff; padding: 0 10px">
        <el-tab-pane label="远程调度" name="remote" />
        <el-tab-pane label="本地执行" name="local" />
      </el-tabs>

      <div v-if="selectedTab === 'remote'">
        <el-table
          v-loading="loading"
          border
          style="width: 100%"
          :data="taskList"
        >
          <el-table-column prop="id" align="center" label="任务ID" />
          <el-table-column prop="taskName" align="center" label="任务名称" />
          <el-table-column
            label="任务状态"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-tag
                effect="dark"
                :color="
                  ['#e5476c'][['任务终止'].indexOf(scope.row.status_dictText)]
                "
                :type="
                  [
                    'primary',
                    'primary',
                    'danger',
                    'danger',
                    'warning',
                    'success',
                    'info',
                  ][
                    [
                      '待执行',
                      '正在执行',
                      '执行出错',
                      '任务终止',
                      '执行超时',
                      '执行成功',
                      '调度已删除',
                    ].indexOf(scope.row.status_dictText)
                  ]
                "
                >{{ scope.row.status_dictText }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="createTime" align="center" label="创建时间" />
          <el-table-column fixed="right" align="center" label="操作">
            <template slot-scope="scope">
              <el-button
                slot="reference"
                type="text"
                @click="logFn(scope.row.id)"
                >日志</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <pagination
          :total="total"
          :page.sync="listQuery.pageIndex"
          :limit.sync="listQuery.pageSize"
          @pagination="getList(listQuery)"
        />

        <el-dialog
          width="70%"
          title="日志详情"
          :visible.sync="innerVisible"
          append-to-body
          @closed="cancel"
        >
          <el-table
            v-infinite-scroll="detailLogLoadMore"
            :data="detailLogTableData"
            style="width: 100%"
            height="calc(40vh)"
            size="mini"
          >
            <el-table-column type="index" />
            <el-table-column prop="bank_name" label="类型" width="100">
              <template slot-scope="{ row }">
                <el-tag
                  v-if="row.logType_dictText === '调试'"
                  style="background-color: #666666; color: #ffffff"
                >
                  {{ row.logType_dictText }}
                </el-tag>
                <el-tag
                  v-if="row.logType_dictText === '信息'"
                  style="background-color: #00a1d9; color: #ffffff"
                >
                  {{ row.logType_dictText }}
                </el-tag>
                <el-tag
                  v-if="row.logType_dictText === '警告'"
                  style="background-color: #f47400; color: #ffffff"
                >
                  {{ row.logType_dictText }}
                </el-tag>
                <el-tag
                  v-if="row.logType_dictText === '超时'"
                  style="background-color: #f2b705; color: #ffffff"
                >
                  {{ row.logType_dictText }}
                </el-tag>
                <el-tag
                  v-if="row.logType_dictText === '错误'"
                  style="background-color: #f11c08; color: #ffffff"
                >
                  {{ row.logType_dictText }}
                </el-tag>
                <el-tag
                  v-if="row.logType_dictText === '致命'"
                  style="background-color: #590202; color: #ffffff"
                >
                  {{ row.logType_dictText }}
                </el-tag>
                <el-tag
                  v-if="row.logType_dictText === '成功'"
                  style="background-color: #40be00; color: #ffffff"
                >
                  {{ row.logType_dictText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="content"
              label="内容"
              min-width="300"
              show-overflow-tooltip
            />
            <el-table-column
              prop="createTime"
              label="创建时间"
              min-width="150"
              show-overflow-tooltip
            />
            <div slot="append" style="text-align: center">
              <!--在此处添加你想要插入在表格最后一行的内容-->
              <div
                v-if="detailLogIsMore"
                v-loading="true"
                element-loading-spinner="el-icon-loading"
                style="height: 40px; line-height: 40px"
              >
                &nbsp;
              </div>
              <div v-else style="height: 40px; line-height: 40px; color: #ccc">
                --- 已经到底了 ---
              </div>
            </div>
          </el-table>
        </el-dialog>
      </div>

      <div v-if="selectedTab === 'local'">
        <local-job ref="local" />
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import { taskList, uiautoLogList } from "@/api/task";
import Pagination from "@/components/Pagination";
import LocalJob from "./localJob";
const fs = window.nodeRequire("fs");
const path = window.nodeRequire("path");
const os = window.nodeRequire("os");
const { Task, Log } = require("../../express/database");

export default {
  name: "Job",
  components: {
    Pagination,
    LocalJob,
  },
  data() {
    return {
      selectedTab: "remote",
      loading: false,
      showDialog: false,
      message: [],
      total: 0,
      listQuery: {
        project_name: "",
        status: "all",
        createdAt: [
          new Date(moment().format("YYYY-MM-DD 00:00:00")),
          new Date(moment().format("YYYY-MM-DD 23:59:59")),
        ],
        pageIndex: 1,
        pageSize: 10,
      },
      taskList: [],
      sortOptions: [
        { label: "全部", key: "all" },
        { label: "待执行", key: "0" },
        { label: "正在执行", key: "1" },
        { label: "执行成功", key: "2" },
        { label: "执行出错", key: "3" },
        { label: "执行超时", key: "4" },
        { label: "待重试", key: "5" },
        { label: "任务终止", key: "6" },
        { label: "任务暂停", key: "7" },
        { label: "阻塞中", key: "8" },
        { label: "无效任务", key: "9" },
        { label: "调度已删除", key: "10" },
        { label: "执行器已掉线", key: "11" },
      ],
      localSortOptions: [
        { label: "全部", key: "all" },
        { label: "待执行", key: "waiting" },
        { label: "正在执行", key: "executing" },
        { label: "执行成功", key: "success" },
        { label: "执行超时", key: "timeout" },
        { label: "执行出错", key: "error" },
      ],
      innerVisible: false,
      detailLogTableData: [],
      detailLogPageIndex: 1,
      detailLogPageSize: 10,
      detailLogIsMore: false,
      detailLogWhere: {},
      localTaskList: [],
    };
  },
  created() {
    this.getList(this.listQuery);
  },
  mounted() {},
  methods: {
    // 获取任务列表信息
    getList(listQuery) {
      this.loading = true;
      const _where = {
        actuatorCode: JSON.parse(localStorage.getItem("user")).username,
        column: "createTime",
        order: "desc",
        businessType: 2, // 业务类型为uiauto的数据
      };
      if (listQuery.project_name) {
        _where.superQueryMatchType = "and";
        if (_where.superQueryParams && _where.superQueryParams.length) {
          _where.superQueryParams.push({
            dictCode: "",
            field: "taskName",
            rule: "like",
            type: "string",
            val: listQuery.project_name,
          });
        } else {
          _where.superQueryParams = [
            {
              dictCode: "",
              field: "taskName",
              rule: "like",
              type: "string",
              val: listQuery.project_name,
            },
          ];
        }
      }
      if (listQuery.createdAt) {
        _where.superQueryMatchType = "and";
        if (_where.superQueryParams && _where.superQueryParams.length) {
          _where.superQueryParams.push();
          _where.superQueryParams = _.concat(_where.superQueryParams, [
            {
              field: "createTime",
              rule: "ge",
              type: "datetime",
              val: moment(listQuery.createdAt[0]).format("YYYY-MM-DD HH:mm:ss"),
            },
            {
              field: "createTime",
              rule: "le",
              type: "datetime",
              val: moment(listQuery.createdAt[1]).format("YYYY-MM-DD HH:mm:ss"),
            },
          ]);
        } else {
          _where.superQueryParams = [
            {
              field: "createTime",
              rule: "ge",
              type: "datetime",
              val: moment(listQuery.createdAt[0]).format("YYYY-MM-DD HH:mm:ss"),
            },
            {
              field: "createTime",
              rule: "le",
              type: "datetime",
              val: moment(listQuery.createdAt[1]).format("YYYY-MM-DD HH:mm:ss"),
            },
          ];
        }
      }
      if (listQuery.status !== "all") {
        _where.status = listQuery.status;
      }
      _where.superQueryParams = encodeURI(
        JSON.stringify(_where.superQueryParams)
      );
      const postBody = _.extend(_where, {
        pageNo: listQuery.pageIndex,
        pageSize: listQuery.pageSize,
      });
      taskList(postBody).then((taskListRes) => {
        this.loading = false;
        if (taskListRes.code == 200) {
          this.taskList = taskListRes.result.records;
          this.total = taskListRes.result.total;
          this.pageIndex = taskListRes.result.current;
          this.pageSize = taskListRes.result.size;
        }
      });
    },
    // 筛选
    handleFilter() {
      if (this.selectedTab === "remote") {
        this.listQuery.pageIndex = 1;
        this.getList(this.listQuery);
      } else {
        this.$refs.local.getList(this.listQuery);
      }
    },
    // 刷新
    refresh() {
      this.getList(this.listQuery);
    },
    cancel() {
      this.innerVisible = false;
      this.detailLogTableData = [];
      this.detailLogPageIndex = 1;
      this.detailLogPageSize = 10;
      this.detailLogIsMore = false;
      this.detailLogWhere = {};
    },
    logFn(taskId) {
      this.innerVisible = true;
      this.detailLogLoadList(taskId);
    },
    detailLogLoadList(taskId) {
      this.detailLogWhere = { taskId: taskId };
      const postBody = {
        taskId: taskId,
        order: "desc",
        column: "createTime",
        pageNo: this.detailLogPageIndex,
        pageSize: this.detailLogPageSize,
      };
      uiautoLogList(postBody).then(({ result }) => {
        this.detailLogTableData = result.records;
        this.detailLogPageIndex = result.current;
        this.detailLogPageSize = result.size;
        this.detailLogIsMore = result.current * result.size <= result.total;
      });
    },
    getRemote: _.debounce(function () {
      if (this.detailLogIsMore) {
        this.detailLogPageIndex++;
        const postBody = {
          taskId: this.detailLogWhere.taskId,
          order: "desc",
          column: "createTime",
          pageNo: this.detailLogPageIndex,
          pageSize: this.detailLogPageSize,
        };
        uiautoLogList(postBody).then(({ result }) => {
          this.detailLogTableData = this.detailLogTableData.concat(
            result.records
          );
          this.detailLogPageIndex = result.current;
          this.detailLogPageSize = result.size;
          this.detailLogIsMore = result.current * result.size <= result.total;
        });
      }
    }, 500),
    detailLogLoadMore() {
      this.getRemote();
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep.el-select-dropdown__item {
  font-size: 12px;
}
</style>
