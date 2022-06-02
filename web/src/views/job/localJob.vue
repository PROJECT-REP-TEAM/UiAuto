<template>
  <div>
    <el-table v-loading="loading" border style="width: 100%" :data="taskList">
      <el-table-column prop="id" align="center" label="任务ID" />
      <el-table-column prop="name" align="center" label="任务名称" />
      <el-table-column prop="taskName" align="center" label="任务标识" />
      <el-table-column prop="status" align="center" label="任务状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'waiting'" :type="'default'"
            >待执行</el-tag
          >
          <el-tag v-if="scope.row.status === 'executing'" :type="'primary'"
            >正在执行</el-tag
          >
          <el-tag v-if="scope.row.status === 'timeout'" :type="'warning'"
            >执行超时</el-tag
          >
          <el-tag v-if="scope.row.status === 'success'" :type="'success'"
            >执行成功</el-tag
          >
          <el-tag v-if="scope.row.status === 'error'" :type="'danger'"
            >执行失败</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="execTime" align="center" label="执行时间" />
      <el-table-column fixed="right" align="center" label="操作">
        <template slot-scope="scope">
          <el-button slot="reference" type="text" @click="logFn(scope.row.id)"
            >日志</el-button
          >
          <el-button
            slot="reference"
            v-if="scope.row.status === 'waiting'"
            type="text"
            @click="stopFn(scope.row.id)"
            >停止</el-button
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
        <el-table-column prop="logType" label="类型" width="100">
          <template slot-scope="{ row }">
            <el-tag
              v-if="row.logType === 'log'"
              style="background-color: #666666; color: #ffffff"
            >
              调试
            </el-tag>
            <el-tag
              v-if="row.logType === 'info'"
              style="background-color: #00a1d9; color: #ffffff"
            >
              信息
            </el-tag>
            <el-tag
              v-if="row.logType === 'warn'"
              style="background-color: #f47400; color: #ffffff"
            >
              警告
            </el-tag>
            <el-tag
              v-if="row.logType === 'error'"
              style="background-color: #f11c08; color: #ffffff"
            >
              错误
            </el-tag>
            <el-tag
              v-if="row.logType === 'success'"
              style="background-color: #40be00; color: #ffffff"
            >
              成功
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
</template>

<script>
import _ from "lodash";
import moment from "moment";
import { taskList, uiautoLogList } from "@/api/task";
import Pagination from "@/components/Pagination";
const fs = window.nodeRequire("fs");
const path = window.nodeRequire("path");
const os = window.nodeRequire("os");
const { Task, Log } = require("../../express/database");
const { Op } = window.nodeRequire("sequelize");

export default {
  name: "LocalJob",
  components: {
    Pagination,
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
      innerVisible: false,
      detailLogTableData: [],
      detailLogPageIndex: 1,
      detailLogPageSize: 10,
      detailLogIsMore: false,
      detailLogWhere: {},
    };
  },
  created() {
    this.getList(this.listQuery);
  },
  mounted() {},
  methods: {
    // 获取任务列表信息
    getList(listQuery) {
      this.listQuery = listQuery;
      let where = {};
      if (listQuery.project_name) {
        where.name = listQuery.project_name;
      }
      if (!!listQuery.status && listQuery.status !== "all") {
        where.status = listQuery.status;
      }
      if (!!listQuery.createdAt && listQuery.createdAt.length === 2) {
        where[Op.and] = [
          {
            createdAt: {
              [Op.gte]: moment(listQuery.createdAt[0]).format(
                "YYYY-MM-DD HH:mm:ss"
              ),
            },
          },
          {
            createdAt: {
              [Op.lte]: moment(listQuery.createdAt[1]).format(
                "YYYY-MM-DD HH:mm:ss"
              ),
            },
          },
        ];
      }

      Task.findAndCountAll({
        where: where,
        order: [["createdAt", "desc"]],
        offset: (listQuery.pageIndex - 1) * listQuery.pageSize,
        limit: listQuery.pageSize,
      }).then((result) => {
        this.total = result.count;
        _.forEach(result.rows, (item) => {
          item.execTime = moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss");
        });
        this.taskList = result.rows;
      });
    },
    // 筛选
    handleFilter() {
      this.listQuery.pageIndex = 1;
      this.getList(this.listQuery);
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
    stopFn(taskId) {
      Task.update(
        {
          status: "error",
        },
        {
          where: {
            id: taskId,
          },
        }
      ).then(() => {
        Log.create({
          taskId: taskId,
          logType: "error",
          content: `手动停止`,
          lineNo: 1,
        }).then((res) => {
          this.$message.success("停止成功");
          this.getList(this.listQuery);
        });
      });
    },
    detailLogLoadList(taskId) {
      this.detailLogWhere = { taskId: taskId };
      Log.findAll({
        where: {
          taskId: taskId,
        },
        order: [
          ["createdAt", "desc"],
          ["lineNo", "desc"],
          ["id", "desc"],
        ],
        offset:
          this.detailLogPageIndex -
          1 +
          (this.detailLogPageIndex - 1) * this.detailLogPageSize,
        limit: this.detailLogPageSize,
      }).then((result) => {
        _.forEach(result, (item) => {
          item.createTime = moment(item.createdAt).format(
            "YYYY-MM-DD HH:mm:ss"
          );
        });
        this.detailLogTableData = _.concat(this.detailLogTableData, result);
        this.detailLogPageIndex++;
        this.detailLogIsMore = !!result && result.length > 0;
      });
    },
    getRemote: _.debounce(function () {
      if (this.detailLogIsMore) {
        this.detailLogLoadList(this.detailLogWhere.taskId);
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
